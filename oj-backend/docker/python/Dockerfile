FROM python:3.12-alpine

RUN addgroup -S runner && adduser -S runner -G runner

COPY runner.py /opt/runner.py

WORKDIR /tmp
USER runner

ENTRYPOINT ["python3", "/opt/runner.py"]
