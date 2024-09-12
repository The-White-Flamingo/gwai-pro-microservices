# Dockerfile
FROM node:lts-alpine

ARG APP_NAME

WORKDIR /usr/src/app

# Copy only necessary files
COPY ./apps/$APP_NAME ./apps/$APP_NAME
COPY ./package.json ./yarn.lock ./

# Install dependencies
RUN yarn install

# Build the app (if necessary)
RUN yarn build --workspace=$APP_NAME

# Set the default command to start your app
CMD ["node", "./apps/$APP_NAME/main.js"]
