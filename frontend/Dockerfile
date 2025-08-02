FROM node:20-alpine

# Update package lists and install security patches
RUN apk update && apk upgrade && apk add --no-cache curl

# Install Expo CLI globally
RUN npm install -g @expo/cli

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use npm install if package-lock.json doesn't exist)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi && npm audit fix --audit-level=moderate || true

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose ports
EXPOSE 19000 19001 19002 8081

# Start the Expo development server with web support
CMD ["npm", "run", "web-dev"] 