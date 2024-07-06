#!/bin/bash

# Check if the container is running
if [ "$(docker ps -q -f name=unrpa_dev)" ]; then
    echo "Stopping and removing existing unrpa_dev container..."
    docker kill unrpa_dev
fi

# Build the new image and run the container
docker build -t unrpa:latest . && \
docker run --rm --init -v "$(pwd)":/app -p 3000:3000 --name unrpa_dev unrpa:latest
