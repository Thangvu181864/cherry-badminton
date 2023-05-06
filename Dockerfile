###################
# BUILD FOR build
###################
FROM node:18-alpine

USER root

RUN apk update && apk upgrade && apk add --no-cache postgresql-client

RUN mkdir -p /usr/src/app/node_modules && chown -R node:node /usr/src/app

WORKDIR /usr/src/app

COPY package.json .

COPY yarn.lock .

USER node

RUN yarn

COPY --chown=node:node . .

EXPOSE 9000

CMD ["yarn", "start"]
