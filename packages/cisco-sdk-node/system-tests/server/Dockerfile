FROM node:14-slim

RUN npm install -g npm

RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ["package*.json", "*.lock", "./"]
COPY --chown=node:node ./ .

RUN cd packages/cisco-sdk-node

RUN npm install
RUN npm run build
RUN npm pack
RUN mv `npm pack` /tmp/cisco-sdk-node.tgz

RUN cd system-tests/server && npm install && npm install /tmp/cisco-sdk-node.tgz

RUN cd system-tests/server && ls -lR && node server.js
