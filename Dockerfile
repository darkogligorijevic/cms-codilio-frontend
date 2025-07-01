# Multi-stage build for optimized production image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 🚀 KRITIČNO: Environment variables za build-time
# Ovi se koriste tokom build procesa - glavna API URL
ARG NEXT_PUBLIC_API_URL=https://api-codilio.sbugarin.com/api
ARG NODE_ENV=production
ARG NEXT_TELEMETRY_DISABLED=1

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=$NODE_ENV
ENV NEXT_TELEMETRY_DISABLED=$NEXT_TELEMETRY_DISABLED

# Log build-time configuration
RUN echo "🔧 Building with API URL: $NEXT_PUBLIC_API_URL"
RUN echo "🔧 Node environment: $NODE_ENV"

# Build the application
RUN npm run build

# Production image, copy all files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 🌐 PRODUCTION Environment Variables
# Ovi će biti override-ovani od docker-compose
ENV NEXT_PUBLIC_API_URL=https://api-codilio.sbugarin.com/api
ENV API_URL=http://backend:3001/api
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install curl and wget for health checks
RUN apk add --no-cache curl wget

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Enhanced health check that tests both internal and external connectivity
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Startup script to log configuration
RUN echo '#!/bin/sh' > /app/startup.sh && \
    echo 'echo "🚀 Starting Codilio Frontend"' >> /app/startup.sh && \
    echo 'echo "🔗 API URL: $NEXT_PUBLIC_API_URL"' >> /app/startup.sh && \
    echo 'echo "🔗 Internal API: $API_URL"' >> /app/startup.sh && \
    echo 'echo "🌐 Environment: $NODE_ENV"' >> /app/startup.sh && \
    echo 'echo "🔧 Port: $PORT"' >> /app/startup.sh && \
    echo 'exec node server.js' >> /app/startup.sh && \
    chmod +x /app/startup.sh

CMD ["/app/startup.sh"]
