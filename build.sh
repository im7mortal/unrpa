#!/bin/bash

# Build the Docker image
podman build -t build_frontend .

# Run the container to build TypeScript to JavaScript.
# Assumes tsconfig.json and other required files are in the current directory.

# install the dependencies
podman run --rm -v "$(pwd)":/app:Z -v "$(pwd)"/unrpapp:/app/unrpapp:Z  build_frontend /bin/bash -c "npm install"

# compile the web_resource.ts
podman run --rm -v "$(pwd)":/app:Z build_frontend /bin/bash -c "npm run build"
#podman run --rm -v "$(pwd)":/app:Z \
#                -v "$(pwd)"/unrpapp:/app/unrpapp:Z \
#                build_frontend /bin/bash -c "npx create-react-app /app/unrpapp --template typescript"
podman run --name react --rm -p 9087:3000 -v "$(pwd)":/app:Z \
                -v "$(pwd)"/unrpapp:/app/unrpapp:Z \
                build_frontend /bin/bash -c "cd /app/unrpapp && npm install && npm start"


