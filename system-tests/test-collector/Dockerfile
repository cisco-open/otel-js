FROM node:14-slim

# Create app directory
WORKDIR /usr/src/app


COPY --chown=node:node ["package*.json", "*.lock", "./"]
COPY --chown=node:node ./ .

RUN cd system-tests/test-collector && npm install

RUN cd system-tests/test-collector && node test-collector.js &
