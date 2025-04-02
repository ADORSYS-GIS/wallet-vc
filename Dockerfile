# Use an official Node.js runtime as the base image
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the entire project
COPY . .

# Build the React app
RUN npm run build

# Use a lightweight web server to serve the built files
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start the server
CMD ["nginx", "-g", "daemon off;"]
