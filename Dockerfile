# Stage 1: Build the app
FROM node:lts-alpine AS builder

ARG APP_NAME

WORKDIR /usr/src/app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of the application code and build the app
COPY . .
RUN yarn build ${APP_NAME}

# Stage 2: Prepare the production image
FROM node:lts-alpine

ARG APP_NAME
ENV NODE_ENV production

WORKDIR /usr/src/app

# Copy only production dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

# Copy the build artifacts from the builder stage
COPY --from=builder /usr/src/app/dist /usr/src/app/dist

CMD ["sh", "-c", "node dist/apps/$APP_NAME/main.js"]

