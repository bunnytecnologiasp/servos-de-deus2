# Stage 1: Build the React application
FROM node:20-alpine as builder

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
# FIX: Removed package-lock.json reference as it might not exist in the context
COPY package.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
# We use the default build script which generates files in the 'dist' directory
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine as production

# Copy the custom Nginx configuration
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built application files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 3000 (as requested by the user)
EXPOSE 3000

# Nginx runs as the default command
CMD ["nginx", "-g", "daemon off;"]