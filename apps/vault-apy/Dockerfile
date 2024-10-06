FROM node:20

RUN curl -L https://foundry.paradigm.xyz | bash

ENV PATH="${PATH}:/root/.foundry/bin"

RUN foundryup

WORKDIR /usr/src/app

COPY ./dist ./dist

ENV DEBUG=vault-apy
CMD [ "node", "dist/index.js"]