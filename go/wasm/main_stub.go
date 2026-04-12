//go:build !js || !wasm
// +build !js !wasm

package main

// Stub entrypoint so non-wasm environments (e.g. default CI/code indexing)
// do not fail on syscall/js imports from main.go.
func main() {}

