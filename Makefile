.PHONY: test build linux

test:
	go test ./...
	go vet ./...

build:
	go build -trimpath -o bin/game-of-life-server .

linux:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 GOAMD64=v1 go build -trimpath -o bin/game-of-life-server-linux-amd64 .
