# Build-Stage: Dependencies installieren und Produktions-Build erzeugen
FROM node:20-alpine AS build
# npm 10.8.2 aus dem Basis-Image bricht "npm ci" im Container ab
# ("Exit handler never called") – daher vorab aktualisieren
RUN npm install -g npm@latest
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime-Stage: statische Dateien über nginx ausliefern
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
