FROM node:lts-alpine

RUN addgroup -S runner && adduser -S runner -G runner

COPY runner.js /opt/runner.js

WORKDIR /tmp
USER runner

ENTRYPOINT ["node", "/opt/runner.js"]
