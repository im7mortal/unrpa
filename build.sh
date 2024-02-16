docker build -t build_gui .
docker run --rm -v "$(pwd)":/app build_gui go build -buildvcs=false
