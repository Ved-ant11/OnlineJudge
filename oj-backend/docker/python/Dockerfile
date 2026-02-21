FROM python:3.12-alpine

RUN addgroup -S runner && adduser -S runner -G runner

WORKDIR /tmp
USER runner

ENTRYPOINT ["python3", "-c", "import sys, os, base64; code = base64.b64decode(os.environ.get('USER_CODE', '')).decode('utf-8'); exec(compile(code, 'solution.py', 'exec'))"]
