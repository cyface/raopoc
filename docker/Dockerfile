# Multi-stage build for optimized production image
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml .pnpmrc ./

# Copy Prisma schema before installing dependencies
COPY prisma ./prisma

RUN ls

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm exec prisma generate

# Build frontend and backend
RUN pnpm run build && pnpm run build:server

# Production stage
FROM node:20-alpine AS production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files and Prisma schema
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/server/dist ./server/dist

# Copy node_modules from builder and prune dev dependencies
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
RUN pnpm prune --prod

# Copy necessary configuration files
COPY --chown=nodejs:nodejs server ./server
COPY --chown=nodejs:nodejs config ./config
COPY --chown=nodejs:nodejs public ./public

# Switch to non-root user
USER nodejs

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server/dist/main.js"]