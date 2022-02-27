FROM node:14-slim

RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ["binding.gyp", "package*.json", "*.lock", "./"]
COPY --chown=node:node ["./src/native_ext", "./src/native_ext"]
COPY --chown=node:node ./ .
RUN npm install

RUN pwd
RUN ls -lR
