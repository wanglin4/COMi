.PHONY: build test test-race generate

build:
	go build -o go-plugin .

# unit tests run against an in-memory state store; no Canopy node needed
test:
	go test -count=1 ./contract

# regenerate protobuf bindings (needs protoc, protoc-gen-go v1.36.6, protoc-go-inject-tag)
generate:
	cd proto && ./_generate.sh

# race detector is unsupported on android/arm64 (Termux); use this on desktop Linux/macOS
test-race:
	go test -race -count=1 ./contract
