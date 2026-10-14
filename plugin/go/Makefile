.PHONY: build test generate

build:
	go build -o go-plugin .

# unit tests run against an in-memory state store; no Canopy node needed
test:
	go test -race -count=1 ./contract

# regenerate protobuf bindings (needs protoc, protoc-gen-go v1.36.6, protoc-go-inject-tag)
generate:
	cd proto && ./_generate.sh
