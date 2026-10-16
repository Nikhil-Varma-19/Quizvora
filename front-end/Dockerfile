ARG NODE_VERSION=22.14.0

FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build
