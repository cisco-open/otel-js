FROM node:14-slim

RUN npm install -g npm

RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node ["package*.json", "*.lock", "./"]
COPY --chown=node:node ./ .

RUN npm install

RUN apt-get update; apt-get install curl
RUN curl http://0.0.0.0:7080
RUN curl http://server:7080


RUN ls -la && node client.js
