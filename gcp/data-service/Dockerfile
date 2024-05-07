FROM node:16

WORKDIR /usr/src/app

COPY ./dist/packages /usr/dist/packages
COPY package*.json ./
COPY tsconfig.build.json ./
COPY ./src ./src

# Install peer dependencies
RUN yarn add @apollo/client@3.8.4 graphql@16.6.0 @graphprotocol/client-cli@^2.2.22 @graphql-mesh/utils@0.93.1
RUN yarn install
RUN yarn build

CMD [ "yarn", "start" ]
