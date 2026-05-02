# Base image
FROM node:18-alpine AS production

# Create app directory
WORKDIR /app

# On copie le package.json depuis le dossier server
COPY server/package*.json ./

# Installation des dépendances
RUN npm install --omit=dev

# On copie tout le reste du dossier server vers /app
COPY server/ .

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]
