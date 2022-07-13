FROM node:16.14.2

RUN npm install -g npm

RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ["package.json", "./"]
COPY --chown=node:node ./ .

RUN npm install --ignore-scripts
RUN npx lerna bootstrap --no-ci --hoist --nohoist='zone.js' --nohoist='mocha' --nohoist='ts-mocha'
RUN cat lerna-debug.log

WORKDIR /home/node/app/packages/cisco-sdk-node

RUN mv `npm pack` /tmp/cisco-sdk-node.tgz

RUN cd system-tests/server && npm install && npm install /tmp/cisco-sdk-node.tgz

RUN cd system-tests/server && ls -lR && node server.js
