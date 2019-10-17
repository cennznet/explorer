FROM node:10.15.0 as builder
WORKDIR /workdir

COPY package.json yarn.lock ./
RUN yarn install

COPY tsconfig.json webpack.config.js ./
COPY locales ./locales
COPY views ./views
COPY src ./src
COPY settings/appsettings.json ./settings/appsettings.json
RUN  npm run build
RUN npm run lint

# production images

FROM node:10.15.0-alpine

RUN apk add --no-cache --update tini
RUN apk add --no-cache --update curl
WORKDIR /workdir
COPY --from=builder /workdir .
RUN npm rebuild node-sass

ENTRYPOINT ["/sbin/tini", "--", "node"]
CMD ["./dist/main.js"]
