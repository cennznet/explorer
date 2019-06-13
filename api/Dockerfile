FROM python:3.6-alpine

WORKDIR /src/github.com/cennznet/explorer/api

RUN apk add gcc musl-dev postgresql-dev

COPY requirements.txt requirements.main.txt
COPY chalice-api/requirements.txt requirements.txt

RUN pip install --upgrade pip && pip install -r requirements.main.txt && pip install -r requirements.txt

COPY chalice-api .

CMD ["chalice", "local", "--stage=local", "--host=0.0.0.0", "--port=80"]
