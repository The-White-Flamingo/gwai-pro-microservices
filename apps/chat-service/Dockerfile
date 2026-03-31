FROM public.ecr.aws/docker/library/node:lts-alpine AS development

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --network-timeout 600000 --non-interactive

COPY . .

RUN yarn build chat-service

CMD ["yarn", "start:dev", "chat-service"]

FROM public.ecr.aws/docker/library/node:lts-alpine AS production

ARG NODE_ENV=production

ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --production --network-timeout 600000 --non-interactive

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/apps/chat-service/main"]
