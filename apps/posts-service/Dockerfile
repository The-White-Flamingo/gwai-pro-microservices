FROM public.ecr.aws/docker/library/node:lts-alpine AS development

WORKDIR /usr/src/app

COPY package*.json  yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build posts-service

FROM public.ecr.aws/docker/library/node:lts-alpine AS production

ARG NODE_ENV=production

ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json  yarn.lock ./

RUN yarn install --production

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/apps/posts-service/main"]