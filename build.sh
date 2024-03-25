podman build -t build_gui .
podman run --rm -v "$(pwd)":/app build_gui go build -buildvcs=false
