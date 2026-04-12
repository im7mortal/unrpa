#!/bin/bash

IMAGE_NAME="firefox-videomaker"

SCREENSHOT_FOLDER=$(cd "../../public/preview" || exit 1; pwd)
OUT_FOLDER=$(pwd)/out

docker build -t $IMAGE_NAME . && \
 \
docker run --rm --network="host" -v "$SCREENSHOT_FOLDER":/screenshots -v "$OUT_FOLDER":/out $IMAGE_NAME
