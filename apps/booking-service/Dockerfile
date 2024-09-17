# Stage 1: Build the app
FROM node:alpine AS builder

# Set the working directory
WORKDIR /usr/src/app

# Copy the root package.json and yarn.lock files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the entire application code
COPY . .

# Build the specific service
RUN yarn build booking-service

# Stage 2: Prepare the production image
FROM node:alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy only production dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

# Copy the build artifacts from the builder stage
COPY --from=builder /usr/src/app/dist /usr/src/app/dist

# Start the application
CMD ["node", "dist/apps/booking-service/main.js"]
