FROM node:14.19.3

RUN npm install -g npm@6.14.12

RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ["package.json", "./"]
COPY --chown=node:node ./ .

WORKDIR /home/node/app/packages/cisco-sdk-node

RUN npm install
RUN npm run build
RUN mv `npm pack` /tmp/cisco-sdk-node.tgz

RUN cd system-tests/server && npm install && npm install /tmp/cisco-sdk-node.tgz

RUN cd system-tests/server && ls -lR && node server.js
