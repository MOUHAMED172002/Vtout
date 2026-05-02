# Base image
FROM node:18-alpine AS production

# Create app directory
WORKDIR /app

# On copie tout ce qui est dans le contexte de build
COPY . .

# On vérifie où on est et ce qu'il y a (pour le débug dans les logs Dokploy)
RUN ls -la

# On force l'installation en pointant directement le dossier courant
RUN npm install --omit=dev --prefix .

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]
