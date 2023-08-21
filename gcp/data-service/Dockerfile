FROM node:16

WORKDIR /usr/src/app

COPY ./dist/packages /usr/dist/packages
COPY package*.json ./
COPY tsconfig.build.json ./
COPY ./src ./src

RUN yarn install
RUN yarn build

CMD [ "yarn", "start" ]
