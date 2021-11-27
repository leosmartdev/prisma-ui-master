# This docker container is for building the releases of prisma electron.
# For normal codebuilds, see the Dockerfile at the top of the repo.
FROM electronuserland/builder:wine-mono

# Install yarn
RUN npm install -g yarn lerna

# Apt get install dependencies
RUN apt-get update; \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
    python3-pip \
    zip

# Upgrade pip
RUN pip3 install --upgrade pip

# Install AWS command line
RUN pip3 install awscli --upgrade

# Grab the 7zip dlls and exe we will need for release builds
RUN wget --quiet https://s3.amazonaws.com/prisma-tool/build/7z.exe
RUN wget --quiet https://s3.amazonaws.com/prisma-tool/build/7-zip.dll
RUN wget --quiet https://s3.amazonaws.com/prisma-tool/build/7z.dll
RUN mkdir -p /opt/7zip/
RUN mv 7z.exe 7-zip.dll 7z.dll /opt/7zip/
