#!/bin/bash

# Function to check if the container exists (running or stopped)
is_container_existing() {
    [ "$(docker ps -a -q -f name=unrpa_dev)" ]
}

# Check if the container exists
if is_container_existing; then
    echo "Stopping and removing existing unrpa_dev container..."
    docker kill unrpa_dev

    # Wait for the container to be removed
    while is_container_existing; do
        sleep 1
    done
fi

# Build the new image and run the container
docker build -t unrpa:latest . && \
docker run --rm --init -v "$(pwd)":/app -p 5173:5173 --name unrpa_dev unrpa:latest
