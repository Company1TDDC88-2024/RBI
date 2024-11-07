# Step 1: Build the application
FROM node AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

ENV VITE_API_URL=https://tddc88-company1-ht24.kubernetes-public.it.liu.se/api

# Build the application for production (ignore TypeScript errors)
RUN npm run build --noEmitOnError false

# Step 2: Serve the application
FROM docker.io/nginx:alpine

# Remove the default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the built application from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx (it runs by default)
CMD ["nginx", "-g", "daemon off;"]