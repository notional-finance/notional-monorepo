FROM node:16

WORKDIR /usr/src/app

COPY ./dist/packages /usr/dist/packages
COPY package*.json ./
COPY tsconfig.build.json ./
COPY ./src ./src

RUN yarn install
# Install peer dependencies
RUN yarn add @apollo/client@3.8.4 graphql@16.6.0
RUN yarn build

CMD [ "yarn", "start" ]
