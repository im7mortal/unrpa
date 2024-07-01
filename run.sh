 docker build -t unrpa:latest . && \
docker run --rm --init  -v "$(pwd)":/app -p 3000:3000 --name unrpa_dev unrpa:latest