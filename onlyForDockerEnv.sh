#!/bin/bash
npm install msw/node

# Check if running in Docker
if [ "$DOCKER_ENV" = "TRUE" ]; then
#    cp /unrpa.wasm ./public/unrpa.wasm
    npm install
fi