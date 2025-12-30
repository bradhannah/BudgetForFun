#!/bin/bash

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BUN_PORT=3000
VITE_PORT=1420
BUN_BIN="${PROJECT_ROOT}/src-tauri/binaries/bun-sidecar-aarch64-apple-darwin"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Process tracking
PIDS=()
FAILED=0

# Logging functions
log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }
log_step() { echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n${GREEN}  $1${NC}\n"; }

# Start process with PID tracking
start_process() {
  local name="$1"
  local cmd="$2"
  local dir="$3"
  
  log_step "Starting $name..."
  cd "$PROJECT_ROOT/$dir" || exit 1
  
  if [ "$name" = "Bun backend" ]; then
    $BUN_BIN $cmd > "$SCRIPT_DIR/logs/${name}.log" 2>&1 &
  else
    $cmd > "$SCRIPT_DIR/logs/${name}.log" 2>&1 &
  fi
  local pid=$!
  PIDS+=("$pid")
  
  log_info "$name started with PID $pid"
  echo $pid > "$SCRIPT_DIR/pids/${name}.pid"
}

# Quick health check
check_service() {
  local name="$1"
  local url="$2"
  
  log_info "Checking $name at $url..."
  if curl -f -s --max-time 3 "$url" > /dev/null 2>&1; then
    log_info "$name is responding"
    return 0
  else
    log_error "$name is NOT responding"
    FAILED=1
    return 1
  fi
}

# Test integration
test_integration() {
  log_step "Testing service integration..."
  
  log_info "Testing backend health..."
  local response=$(curl -s http://localhost:$BUN_PORT/health 2>/dev/null || echo "failed")
  
  if [ "$response" = "failed" ]; then
    log_error "Backend health check failed"
    FAILED=1
    return 1
  fi
  
  log_info "Integration test passed"
  return 0
}

# Cleanup
cleanup() {
  log_step "Cleaning up processes..."
  
  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      log_info "Terminating PID $pid"
      kill "$pid" 2>/dev/null || true
      
      local count=0
      while kill -0 "$pid" 2>/dev/null && [ $count -lt 5 ]; do
        sleep 1
        ((count++))
      done
      
      if kill -0 "$pid" 2>/dev/null; then
        log_warn "Force killing PID $pid"
        kill -9 "$pid" 2>/dev/null || true
      fi
    fi
  done
  
  rm -rf "$SCRIPT_DIR/pids"
  
  if [ $FAILED -eq 0 ]; then
    rm -rf "$SCRIPT_DIR/logs"
  else
    log_error "Logs preserved in $SCRIPT_DIR/logs/"
  fi
}

# Main
main() {
  log_step "Starting Smoke Test"
  
  make kill-dev
  
  mkdir -p "$SCRIPT_DIR/logs"
  mkdir -p "$SCRIPT_DIR/pids"
  
  trap cleanup EXIT INT TERM
  
  start_process "Bun backend" "run server.ts" "api"
  sleep 3
  
  start_process "Vite dev server" "npm run dev" "."
  sleep 3
  
  check_service "Bun backend" "http://localhost:$BUN_PORT/health" || true
  check_service "Vite dev server" "http://localhost:$VITE_PORT/" || true
  
  if [ $FAILED -eq 0 ]; then
    test_integration
  fi
  
  log_step "Smoke Test Complete"
  
  if [ $FAILED -eq 0 ]; then
    log_info "All checks passed!"
    exit 0
  else
    log_error "Smoke test failed!"
    exit 1
  fi
}

# Run main
main "$@"
