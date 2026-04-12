# Legacy Root Docker Notes (Moved Here)

These notes preserve the useful Go/WASM pieces that were previously in the
root `Dockerfile` and Docker helper scripts.

## 1) Old Go->WASM build stage

The old root Dockerfile had an optional Go stage for WASM build:

```dockerfile
#FROM registry.hub.docker.com/library/golang:1.22.4-bookworm as build
#
#WORKDIR /build
#
#COPY go/go.mod .
#COPY go/go.sum .
#
#RUN go list -e $(go list -f '{{.Path}}' -m all); exit 0
#
#COPY go .
#
#RUN GOOS=js GOARCH=wasm go build -o wasm/unrpa.wasm wasm/main.go
```

Equivalent command outside Docker:

```bash
cd go
GOOS=js GOARCH=wasm go build -o wasm/unrpa.wasm wasm/main.go
```

Or using the script:

```bash
cd go/wasm
./wasm.sh
```

## 2) Old "publish wasm to web app" hint

A commented line in `onlyForDockerEnv.sh` showed the intended publish step:

```bash
# cp /unrpa.wasm ./public/unrpa.wasm
```

Equivalent local flow now:

```bash
cd go/wasm
./wasm.sh ../../public/unrpa.wasm
```

## 3) Old container runtime intent

Previous root `run.sh` mostly handled:

- kill old container named `unrpa_dev`
- `docker build` image
- `docker run -p 5173:5173 -v "$(pwd)":/app`

This is now replaced by Dev Container workflow, but the Go/WASM commands above
remain relevant for the side Go experiment.
