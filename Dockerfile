# Use Debian-based Node image to avoid musl issues
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the project
COPY . .

# Build the project
RUN npm run build

# Expose Vite preview port
EXPOSE 4173

# Run the preview server
CMD ["npm", "run", "preview"]
