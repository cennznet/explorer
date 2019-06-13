FROM node:10.15.0 as builder
WORKDIR /workdir

COPY package.json yarn.lock ./
RUN yarn install

COPY tsconfig.json ./
COPY src ./src
COPY settings/appsettings.json ./settings/appsettings.json
RUN npm run build && npm prune --production

# production images
FROM node:10.15.0-alpine

RUN apk add --no-cache --update tini
RUN apk add --no-cache --update curl

WORKDIR /workdir
COPY --from=builder /workdir .

ENTRYPOINT ["/sbin/tini", "--", "node"]
CMD ["./dist/main.js"]
