# Docker container for building the repo. For the container to build electron installers,
# see packages/prisma-electron/Dockerfile

FROM node:14

# Apt get install dependencies
RUN apt-get update; \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
    python3-pip

# Upgrade pip
RUN pip3 install --upgrade pip

# Install mkdocs
RUN pip3 install mkdocs mkdocs-material pymdown-extensions

# Install AWS command line
RUN pip3 install awscli --upgrade
