#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GO_WASM_DIR="$SCRIPT_DIR"
GO_ROOT_DIR="$(cd "$GO_WASM_DIR/.." && pwd)"

# Legacy default from old Docker flow: keep artifact under go/wasm.
# You can override output path, for example:
#   ./wasm.sh ../../public/unrpa.wasm
OUT_WASM="${1:-$GO_WASM_DIR/unrpa.wasm}"

GOOS=js GOARCH=wasm go build -o "$OUT_WASM" "$GO_WASM_DIR/main.go"
echo "Built WASM: $OUT_WASM"
