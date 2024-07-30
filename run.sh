#!/bin/bash

CONTAINER_NAME="unrpa_dev"
IMAGE_NAME="unrpa:latest"

# Function to check if the container exists (running or stopped)
is_container_existing() {
    [ "$(docker ps -a -q -f name=$CONTAINER_NAME)" ]
}

# Check if the container exists
if is_container_existing; then
    echo "Stopping and removing existing $CONTAINER_NAME container..."
    docker kill $CONTAINER_NAME

    # Wait for the container to be removed
    while is_container_existing; do
        sleep 1
    done
fi

# Build the new image and run the container
docker build -t $IMAGE_NAME . && \
docker run --rm --init -v "$(pwd)":/app -p 5173:5173 --name $CONTAINER_NAME $IMAGE_NAME
