# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
# Using npm ci for cleaner and more reliable builds in CI/CD environments
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM nginx:stable-alpine

# Copy the build output from the build stage to the nginx html directory
# The build output from Vite is in the 'dist' folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
