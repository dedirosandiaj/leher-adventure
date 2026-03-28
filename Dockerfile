# Use Node.js 20 LTS
FROM node:20-alpine AS base

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy all files except uploads (will be mounted as volume)
COPY . .
RUN rm -rf public/uploads

# Create necessary directories
RUN mkdir -p prisma
RUN mkdir -p public/uploads/hero
RUN mkdir -p public/uploads/gallery
RUN mkdir -p public/uploads/team

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", ".next/standalone/server.js"]
