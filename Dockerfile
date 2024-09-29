FROM node:lts-alpine

ARG APP_NAME

WORKDIR /usr/src/app

COPY package.json ./

COPY yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build ${APP_NAME}

CMD [ "node", "dist/apps/${APP_NAME}/main.js" ]