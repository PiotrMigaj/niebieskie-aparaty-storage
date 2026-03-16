# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=production

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S -G appgroup appuser

# Copy only the necessary files from the build stage
COPY --from=builder /app/.output /app/.output

# Set the appropriate permissions for the app directory
RUN chown -R appuser:appgroup /app

# Switch to the non-root user
USER appuser

# Expose the port
EXPOSE ${NITRO_PORT:-3333}

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${NITRO_PORT:-3333}/ || exit 1

# Start the application
CMD ["node", ".output/server/index.mjs"]
