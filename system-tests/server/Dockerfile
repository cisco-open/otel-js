FROM node:14-slim

RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ["package*.json", "*.lock", "./"]
COPY --chown=node:node ./ .
RUN npm install

RUN npm run

RUN npm pack

RUN cd system-tests/server && npm install && npm install ../../cisco-opentelemetry-node-0.0.0-development.tgz

RUN cd system-tests/server && ls -lR && node server.js
