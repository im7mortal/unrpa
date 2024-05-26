# Use a Node base image
FROM registry.hub.docker.com/library/node:21

# Install build-essential for native dependencies
RUN apt-get update && apt-get install -y \
     build-essential

# Set the working directory inside the container
WORKDIR /app
