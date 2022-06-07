FROM node:14-slim

RUN npm install -g npm

RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ["package*.json", "*.lock", "./"]
COPY --chown=node:node ./ .
RUN npm install

RUN npm run build

RUN npm pack

RUN cd system-tests/express/server && npm install && npm install ../../../cisco-telescope-0.0.0-development.tgz

RUN cd system-tests/express/server && ls -lR && node server.js
