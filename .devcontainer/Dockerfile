FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

# Install build-essential for native dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
     && apt-get install -y build-essential

# We don't need to copy the source code because devcontainers mounts the workspace.
# But we might want to install global packages if needed.
