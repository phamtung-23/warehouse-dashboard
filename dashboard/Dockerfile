# ==========================================
# Multi-stage Dockerfile for Berry Material React
# ==========================================

# Stage 1: Build stage
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Enable Corepack for Yarn 4.x support
RUN corepack enable

# Copy package files and Yarn configuration
COPY package.json .yarnrc.yml ./
COPY yarn.lock* ./
COPY .yarn ./.yarn

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . ./

# Build the application
RUN yarn build

# Stage 2: Development stage
FROM node:22-alpine AS development

# Set working directory
WORKDIR /app

# Install system dependencies for browser opening (but won't actually open)
RUN apk add --no-cache xdg-utils

# Enable Corepack for Yarn 4.x support
RUN corepack enable

# Copy package files and Yarn configuration
COPY package.json .yarnrc.yml ./
COPY yarn.lock* ./
COPY .yarn ./.yarn

# Install dependencies
RUN yarn install

# Copy source code
COPY . ./

# Expose port
EXPOSE 5173

# Set environment variables for Vite
ENV VITE_HOST=0.0.0.0
ENV VITE_PORT=5173

# Start development server - force port and host, ignore config
CMD ["yarn", "start", "--host", "0.0.0.0", "--port", "5173"]

# Stage 3: Production stage - Serve with a simple Node.js server
FROM node:22-alpine AS production

# Set working directory
WORKDIR /app

# Install serve globally to serve static files
RUN npm install -g serve

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start server
CMD ["serve", "-s", "dist", "-l", "3000"]