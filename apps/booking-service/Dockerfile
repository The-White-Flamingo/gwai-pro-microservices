# Stage 1: Build the app
FROM node:lts-alpine AS builder

# Set the working directory
WORKDIR /usr/src/app

# Copy the package manager files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the entire application code, including the service being built
COPY . .

# Build the specific service
RUN yarn build booking-service

# Stage 2: Prepare the production image
FROM node:lts-alpine

# Set the service name as an argument and environment variable
ENV NODE_ENV=production

# Set the working directory
WORKDIR /usr/src/app

# Copy only production dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

# Copy the build artifacts from the builder stage
COPY --from=builder /usr/src/app/dist /usr/src/app/dist

# Start the application by pointing to the correct path in dist/apps
CMD ["node", "dist/apps/booking-service/main.js"]
