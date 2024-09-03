FROM node:20

RUN curl -L https://foundry.paradigm.xyz | bash

ENV PATH="${PATH}:/root/.foundry/bin"

RUN foundryup

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY ./lib ./lib

ENV DEBUG=vault-apy
CMD [ "yarn", "start"]
