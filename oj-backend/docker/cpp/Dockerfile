FROM alpine:latest

RUN apk update && apk add --no-cache build-base

RUN addgroup -S runner && adduser -S runner -G runner

COPY run.sh /opt/run.sh
RUN chmod +x /opt/run.sh

WORKDIR /workspace

RUN chown runner:runner /workspace

USER runner

ENTRYPOINT ["/opt/run.sh"]
