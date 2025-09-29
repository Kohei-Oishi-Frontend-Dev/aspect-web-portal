# Stage 1 — build
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependency manifests first for better caching
COPY package.json package-lock.json ./
# Use npm ci (package-lock.json exists) — faster & reproducible
RUN npm ci

# Copy the rest of the repo and build
COPY . .
# Ensure the build command exists in package.json (usually "build": "vite build")
RUN npm run build

# Stage 2 — serve with nginx
FROM nginx:stable-alpine
# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled static site from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace default nginx conf to listen on 8080
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]