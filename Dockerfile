# Stage 1: Build the app
FROM node:20-slim AS builder

WORKDIR /app

# Declare build arguments
ARG VITE_LOGIN_API_URL
ARG VITE_AUTH_URL
ARG VITE_CLIENT_ID
ARG VITE_CLIENT_SECRET
ARG VITE_FORGOT_PASSWORD_URL
ARG VITE_PROFILEAPI_URL
ARG VITE_BACKEND_BASE_URL
ARG VITE_ADDRESSY_API_KEY
ARG VITE_ADDRESSY_BASE_URL

# Set as environment variables for Vite
ENV VITE_LOGIN_API_URL=$VITE_LOGIN_API_URL \
    VITE_AUTH_URL=$VITE_AUTH_URL \
    VITE_CLIENT_ID=$VITE_CLIENT_ID \
    VITE_CLIENT_SECRET=$VITE_CLIENT_SECRET \
    VITE_FORGOT_PASSWORD_URL=$VITE_FORGOT_PASSWORD_URL \
    VITE_PROFILEAPI_URL=$VITE_PROFILEAPI_URL \
    VITE_BACKEND_BASE_URL=$VITE_BACKEND_BASE_URL \
    VITE_ADDRESSY_API_KEY=$VITE_ADDRESSY_API_KEY \
    VITE_ADDRESSY_BASE_URL=$VITE_ADDRESSY_BASE_URL

# Copy package files
COPY package*.json ./

# Install dependencies - use npm install instead of npm ci
RUN npm install

# Copy source code
COPY . .

# Build app
RUN npm run build

# Stage 2: Serve app using Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]