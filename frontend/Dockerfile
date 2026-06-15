# --- Build stage ---
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies based on the lockfile for reproducible builds.
COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# --- Runtime stage ---
FROM nginx:1.27-alpine

# SPA routing: serve index.html for unknown paths and proxy /api to backend.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
