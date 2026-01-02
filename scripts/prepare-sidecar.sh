#!/bin/bash

# Prepare Bun sidecar binaries for Tauri bundling
# Downloads and renames to Tauri platform-specific naming convention

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BINARIES_DIR="src-tauri/binaries"

BUN_VERSION="latest"
CURRENT_PLATFORM="aarch64-apple-darwin"

# Platform-specific naming for Tauri
TAURI_PLATFORM_SUFFIX="aarch64-apple-darwin"
# Maps to: aarch64-apple-darwin, x86_64-apple-darwin, 
#         x86_64-pc-windows-msvc, x86_64-unknown-linux-gnu

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "📦 Preparing Bun sidecar for ${TAURI_PLATFORM_SUFFIX}..."

# Create binaries directory
mkdir -p "$BINARIES_DIR"
cd "$BINARIES_DIR"

# Download Bun
echo "Downloading Bun ${BUN_VERSION} for ${CURRENT_PLATFORM}..."
curl -L -o "bun-${CURRENT_PLATFORM}.zip" \
  "https://github.com/oven-sh/bun/releases/latest/download/bun-darwin-aarch64.zip"

# Extract
echo "Extracting Bun..."
unzip -q -o "bun-${CURRENT_PLATFORM}.zip"

# Rename to Tauri convention (base name + platform suffix)
echo "Renaming to Tauri platform convention..."
if [ -f "bun-darwin-aarch64/bun" ]; then
  mv -f "bun-darwin-aarch64/bun" "bun-sidecar-${TAURI_PLATFORM_SUFFIX}"
  echo -e "${GREEN}✓${NC} Bun sidecar prepared as: bun-sidecar-${TAURI_PLATFORM_SUFFIX}"
  
  # Create placeholder for other platforms (for future cross-platform builds)
  touch "bun-sidecar-x86_64-apple-darwin"
  touch "bun-sidecar-x86_64-pc-windows-msvc.exe"
  touch "bun-sidecar-x86_64-unknown-linux-gnu"
  
  echo ""
  echo "📝 Created placeholders for other platforms:"
  echo "  - bun-sidecar-x86_64-apple-darwin (macOS Intel)"
  echo "  - bun-sidecar-x86_64-pc-windows-msvc.exe (Windows)"
  echo "  - bun-sidecar-x86_64-unknown-linux-gnu (Linux)"
else
  echo -e "${YELLOW}⚠${NC} Bun binary not found after extraction"
  exit 1
fi

# Cleanup
rm -rf "bun-${CURRENT_PLATFORM}.zip"
rm -rf "bun-darwin-aarch64"

# Verify binary
if [ -f "bun-sidecar-${TAURI_PLATFORM_SUFFIX}" ]; then
  SIZE=$(du -h "bun-sidecar-${TAURI_PLATFORM_SUFFIX}" | cut -f1)
  echo ""
  echo -e "${GREEN}✓${NC} Sidecar binary ready"
  echo -e "  Location: ${BINARIES_DIR}/bun-sidecar-${TAURI_PLATFORM_SUFFIX}"
  echo -e "  Size: ${SIZE}"
  echo ""
  echo "📝 Configuration in tauri.conf.json:"
  echo -e "  externalBin: ["
  echo -e "    \"binaries/bun-sidecar\""
  echo -e "  ]"
else
  echo -e "${YELLOW}✗${NC} Failed to prepare sidecar binary"
  exit 1
fi

echo ""
echo "📝 Next steps:"
echo "  1. Test sidecar: ./binaries/bun-sidecar-${TAURI_PLATFORM_SUFFIX} --version"
echo "  2. Test Tauri build: cargo build --release"
echo "  3. Verify bundling: Check release bundle for sidecar"
