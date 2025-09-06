# Use Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy the rest of the app
COPY . .

# Expose port (same as in server.js, e.g., 3000)
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
