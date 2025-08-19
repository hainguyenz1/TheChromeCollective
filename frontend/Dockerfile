FROM node:20-alpine

# Install system dependencies
RUN apk update && apk upgrade && apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi && npm audit fix --audit-level=moderate || true

# Copy source code
COPY . .

# Expose ports for Expo development server
EXPOSE 19000 19001 19002 8081

# Start Expo development server for mobile development
CMD ["npx", "expo", "start", "--host", "lan"] 