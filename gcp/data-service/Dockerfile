FROM node:18-alpine

WORKDIR /usr/src/app

COPY ./dist/packages /usr/dist/packages
COPY package*.json ./
COPY tsconfig.build.json ./
COPY ./src ./src

# Install peer dependencies
RUN yarn add @apollo/client@3.8.4 graphql@16.6.0  \
    @graphprotocol/client-cli@^2.2.22 \
    @graphql-mesh/utils@0.93.1 \
    @graphql-mesh/cache-localforage@0.93.1 \
    @graphql-mesh/graphql@0.93.1 \
    @graphql-mesh/store@0.93.1 \
    @graphql-mesh/http@0.93.2 \
    @graphql-mesh/merger-bare@0.93.1 \
    @graphql-mesh/cross-helpers@0.3.4 \
    @graphql-mesh/runtime@0.93.2
RUN yarn install
RUN yarn build

CMD [ "yarn", "start" ]
