FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY ./src ./src
COPY tsconfig.build.json ./

RUN yarn build

CMD [ "yarn", "start" ]
