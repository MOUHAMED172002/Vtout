# Step 1: Build the React app
FROM node:20-alpine AS build

WORKDIR /app

# On copie depuis le sous-dossier frontend
COPY frontend/package*.json ./

# Supprime node_modules stale (évite ETXTBSY sur esbuild au redéploiement)
# puis installe proprement
RUN rm -rf node_modules && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci

COPY frontend/ .
RUN npm run build

# Step 2: Serve the app with Nginx
FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
