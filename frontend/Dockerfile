# --- Build stage ---
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies based on the lockfile for reproducible builds.
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# --- Runtime stage ---
FROM nginx:1.27-alpine

# SPA routing: serve index.html for unknown paths and proxy /api to backend.
COPY nginx.conf /etc/nginx/conf.d/default.conf.template
CMD ["/bin/sh", "-c", "envsubst '${BACKEND_HOST} ${BACKEND_PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
