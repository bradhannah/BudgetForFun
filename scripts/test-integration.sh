#!/bin/bash

# Integration test for frontend-backend communication
# Tests CORS headers, Vite proxy, and direct API access

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUN_PORT=3000
VITE_PORT=1420

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }
log_test() { echo -e "\n${GREEN}━━━ Testing: $1${NC}\n"; }

cleanup() {
  echo -e "\n${GREEN}━━━ Cleanup${NC}"
  pkill -f "bun.*server.ts" 2>/dev/null || true
  pkill -f "vite dev" 2>/dev/null || true
  log_info "Processes terminated"
}

trap cleanup EXIT

log_test "Starting Bun backend on port $BUN_PORT"
/Users/bradhannah/GitHub/BudgetForFun/src-tauri/binaries/bun-sidecar-aarch64-apple-darwin run /Users/bradhannah/GitHub/BudgetForFun/api/server.ts > /tmp/bun-integration-test.log 2>&1 &
BUN_PID=$!
sleep 2

log_test "Starting Vite dev server on port $VITE_PORT"
npm run dev > /tmp/vite-integration-test.log 2>&1 &
VITE_PID=$!
sleep 3

FAILED=0

log_test "1. Direct Backend Access (localhost:3000)"
if curl -s http://localhost:$BUN_PORT/api/health | grep -q "Bun backend working"; then
  log_info "Backend responding correctly"
else
  log_error "Backend not responding or incorrect response"
  FAILED=1
fi

log_test "2. CORS Headers (OPTIONS Preflight)"
if curl -s -i -X OPTIONS http://localhost:$BUN_PORT/api/health | grep -q "Access-Control-Allow-Origin"; then
  log_info "CORS headers present"
else
  log_error "CORS headers missing"
  FAILED=1
fi

log_test "3. CORS Headers with Origin Header"
if curl -s -i -H "Origin: http://localhost:1420" http://localhost:$BUN_PORT/api/health | grep -q "Access-Control-Allow-Origin: \*"; then
  log_info "CORS allows all origins"
else
  log_error "CORS not allowing origins"
  FAILED=1
fi

log_test "4. Vite Proxy (localhost:1420/api/*)"
if curl -s http://localhost:$VITE_PORT/api/health | grep -q "Bun backend working"; then
  log_info "Vite proxy forwarding correctly"
else
  log_error "Vite proxy not working"
  FAILED=1
fi

log_test "5. CORS Headers via Vite Proxy"
if curl -s -i http://localhost:$VITE_PORT/api/health | grep -q "access-control-allow-origin: \*"; then
  log_info "CORS headers present via proxy"
else
  log_error "CORS headers missing via proxy"
  FAILED=1
fi

log_test "6. API Endpoint: /api/payment-sources"
if curl -s http://localhost:$BUN_PORT/api/payment-sources | grep -q "\["; then
  log_info "Payment sources endpoint working"
else
  log_error "Payment sources endpoint failed"
  FAILED=1
fi

log_test "7. API Endpoint via Proxy: /api/payment-sources"
if curl -s http://localhost:$VITE_PORT/api/payment-sources | grep -q "\["; then
  log_info "Payment sources via proxy working"
else
  log_error "Payment sources via proxy failed"
  FAILED=1
fi

echo -e "\n${GREEN}━━━ Integration Test Results${NC}\n"
if [ $FAILED -eq 0 ]; then
  log_info "All integration tests passed!"
  exit 0
else
  log_error "Some integration tests failed"
  echo "Backend log: /tmp/bun-integration-test.log"
  echo "Vite log: /tmp/vite-integration-test.log"
  exit 1
fi
