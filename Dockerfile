FROM node:10-alpine3.9
WORKDIR /dhis2-migration-worker
COPY . .
RUN cd /dhis2-migration-worker && npm i --only=prod
RUN apk upgrade && apk add bash