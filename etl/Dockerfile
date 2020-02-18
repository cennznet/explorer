FROM node:10.14 AS builder
WORKDIR /workdir

COPY package.json package-lock.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
COPY settings/appsettings.json ./settings/appsettings.json
COPY secrets/secrets.json ./secrets/secrets.json

RUN npm run build && npm prune --production

# production images

FROM node:10.14-alpine

RUN apk add --no-cache --update tini
RUN apk add --no-cache --update curl

WORKDIR /workdir
COPY --from=builder /workdir .

ENTRYPOINT ["/sbin/tini", "--", "node"]
CMD ["./dist/main.js"]