# ==========================================
# Multi-stage Dockerfile for NestJS Backend API
# ==========================================

# Stage 1: Build stage
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

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

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies (including dev dependencies)
RUN yarn install

# Copy source code
COPY . ./

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=development

# Start development server
CMD ["yarn", "start:dev"]

# Stage 3: Production stage
FROM node:22-alpine AS production

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy package files
COPY package.json yarn.lock ./

# Install only production dependencies
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Copy built application from builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Switch to non-root user
USER nestjs

# Expose port
# EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start production server
CMD ["node", "dist/main"]
