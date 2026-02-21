FROM node:lts-alpine

RUN addgroup -S runner && adduser -S runner -G runner

WORKDIR /tmp
USER runner

ENTRYPOINT ["node", "-e", "\
    const __input = require('fs').readFileSync(0, 'utf8');\
    global.input = __input;\
    global.lines = __input.split('\\n');\
    global.__lineIndex = 0;\
    global.readline = () => global.lines[global.__lineIndex++] || '';\
    const __code = Buffer.from(process.env.USER_CODE || '', 'base64').toString('utf8');\
    eval(__code);\
    "]
