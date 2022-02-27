FROM node:14-slim

RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ["package*.json", "*.lock", "./"]
COPY --chown=node:node ./ .
RUN npm install

RUN npm run

RUN mv `npm pack` /tmp/cisco-otel-distro.tgz

RUN cd system-tests/server && npm install && npm install /tmp/cisco-otel-distro.tgz

RUN ls -l system-tests/server
