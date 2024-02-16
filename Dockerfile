# Use a Debian base image
FROM registry.hub.docker.com/library/golang:1.22.0-bullseye

# Install GTK and its dependencies
RUN apt-get update && apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev build-essential
RUN apt-get update && apt-get install -y libxxf86vm-dev




# Set the working directory inside the container
WORKDIR /app

