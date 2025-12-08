FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for potential build steps)
RUN npm ci --prefer-offline --no-audit

# Copy source code
COPY . .

# Production stage
FROM node:20-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --only=production --prefer-offline --no-audit

# Copy application code from builder
COPY --from=builder --chown=nodejs:nodejs /app/src ./src

USER nodejs

# Railway provides PORT env variable
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "src/app.js"]