#!/bin/bash

IMAGE_NAME="firefox-screenshot"

docker build -t $IMAGE_NAME . && \
 \
docker run --rm --network="host" -v $(pwd):/app $IMAGE_NAME
