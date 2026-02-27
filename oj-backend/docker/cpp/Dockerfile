FROM alpine:latest

RUN apk update && apk add --no-cache build-base

RUN addgroup -S runner && adduser -S runner -G runner

WORKDIR /workspace

RUN chown runner:runner /workspace

USER runner

ENTRYPOINT ["sh", "-c", "echo $USER_CODE | base64 -d > /workspace/a.cpp && g++ -o /workspace/a.out -x c++ /workspace/a.cpp && /workspace/a.out"]
