 docker build -t unrpa:latest . && \
docker run -v $(pwd):/app -p 3000:3000 unrpa:latest