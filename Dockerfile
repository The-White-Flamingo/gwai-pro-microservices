# Stage 1: Install dependencies and set up nodemon for hot-reload
FROM node:lts-alpine AS development

# Set the working directory
WORKDIR /usr/src/app

# Copy root package.json and yarn.lock
COPY package.json yarn.lock ./

# Install all dependencies
RUN yarn install --frozen-lockfile

# Install nodemon globally for hot-reload
RUN yarn global add nodemon

# Copy the entire application code into the container
COPY . .

# Set environment variable to development
ENV NODE_ENV=development

# Expose default port (modify if different per service)
EXPOSE 3000

# The main command to run the service in development mode, specifying the service via an ARG
ARG APP_NAME
CMD ["yarn", "start:dev", "${APP_NAME}"]
