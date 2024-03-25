# Use a Debian base image
FROM registry.hub.docker.com/library/golang:1.22.1-bullseye

# Install GTK and its dependencies
RUN apt-get update && apt-get install -y \
     libgtk-3-dev \
     libwebkit2gtk-4.0-dev \
     build-essential \
     libxxf86vm-dev

# Speed up local development with precompiled cache for GUI libs
WORKDIR /warmup_cache
COPY docker.cache .
RUN go list -e $(go list -f '{{.Path}}' -m all); exit 0
RUN go install .
# Cache actual dependencies
COPY go.mod .
COPY go.sum .
RUN go list -e $(go list -f '{{.Path}}' -m all); exit 0

# Set the working directory inside the container
WORKDIR /app
