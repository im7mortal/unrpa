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

FROM registry.hub.docker.com/library/node:22

ENV DOCKER_ENV="TRUE"

# Install build-essential for native dependencies
RUN apt-get update && apt-get install -y \
     build-essential

#COPY --from=build /build/wasm/unrpa.wasm /unrpa.wasm

# Set the working directory inside the container
WORKDIR /app

CMD ["npm", "start"]
