# Stage 1: etl

FROM node:10.14-alpine AS etl-builder

WORKDIR /etl

# Resolve dependencies

COPY etl/package.json .
COPY etl/package-lock.json .
COPY etl/tsconfig.json .

RUN npm install

# Transpile to JS

COPY etl .
RUN npm run build && npm prune --production

# Stage 2: orc

FROM golang:1.12-alpine AS orc-builder

WORKDIR /go/src/github.com/cennznet/explorer/orc

ENV GOPATH /go
ENV GOBIN /go/bin

RUN apk update && apk add git dep

COPY orc/Gopkg.toml .
COPY orc/Gopkg.lock .

RUN dep ensure -v -vendor-only

COPY orc .

RUN CGO_ENABLED=0 GOOS=linux go install -a -installsuffix cgo ./...

# Stage 3: etl

FROM node:10.14-alpine

WORKDIR /etl

COPY --from=etl-builder /etl/settings /etl/settings
COPY --from=etl-builder /etl/dist /etl/dist
COPY --from=etl-builder /etl/node_modules /etl/node_modules

COPY --from=orc-builder /go/bin/orc .
COPY --from=orc-builder /go/bin/taskgen .
