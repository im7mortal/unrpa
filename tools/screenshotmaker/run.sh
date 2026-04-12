#!/bin/bash

IMAGE_NAME="selenium-screenshot"

SCREENSHOT_FOLDER=$(cd "../../public/preview" || exit 1; pwd)

docker build -t $IMAGE_NAME . && \
 \
docker run --rm --network="host" -v "$SCREENSHOT_FOLDER":/screenshots $IMAGE_NAME
