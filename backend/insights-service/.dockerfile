# Use official Node.js image as base
FROM node:20-slim

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies (including dotenv)
RUN npm install

# Copy application code
COPY . .

# Copy .env file
COPY .env .env

# Expose port (change if your service uses a different port)
EXPOSE 9000

# Command to run the service (update if your entrypoint is different)
CMD ["node", "app.js"]
