# Stage 1: Build the app
FROM node:20-alpine AS builder

# Pass the service name as a build argument
ARG APP_NAME

# Set the working directory
WORKDIR /usr/src/app

# Copy the package manager files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the entire application code, including the service being built
COPY . .

# Build the specific service
RUN yarn build ${APP_NAME}

# Stage 2: Prepare the production image
FROM node:20-alpine

# Set the service name as an argument and environment variable
ARG APP_NAME
ENV NODE_ENV=production

# Set the working directory
WORKDIR /usr/src/app

# Copy only production dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

# Copy the build artifacts from the builder stage
COPY --from=builder /usr/src/app/dist /usr/src/app/dist

# Start the application by pointing to the correct path in dist/apps
CMD ["node", "dist/apps/${APP_NAME}/main.js"]