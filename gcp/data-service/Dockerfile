FROM node:16

WORKDIR /usr/src/app

COPY ./dist/packages/util /usr/dist/packages/util
COPY package*.json ./
COPY tsconfig.build.json ./
COPY ./src ./src

RUN yarn install
RUN yarn build

CMD [ "yarn", "start" ]
