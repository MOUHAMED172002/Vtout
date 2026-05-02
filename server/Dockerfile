# Base image
FROM node:18-alpine AS production

# Create app directory
WORKDIR /app

# Copy all files from the current directory (server/)
COPY . .

# Install dependencies
RUN npm install --omit=dev

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
