# Use official Node.js image as base
FROM node:20-slim

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Copy .env file
COPY .env .env

# Expose port (change if your service uses a different port)
EXPOSE 8000

# Command to run the service (update if your entrypoint is different)
CMD ["node", "app.js"]
