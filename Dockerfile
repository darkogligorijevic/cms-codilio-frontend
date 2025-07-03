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
ARG NEXT_PUBLIC_API_URL=https://api-codilio.sbugarin.com/api
ARG NODE_ENV=production
ARG NEXT_TELEMETRY_DISABLED=1

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=$NODE_ENV
ENV NEXT_TELEMETRY_DISABLED=$NEXT_TELEMETRY_DISABLED

# Log build-time configuration
RUN echo "🔧 Building with API URL: $NEXT_PUBLIC_API_URL"
RUN echo "🔧 Node environment: $NODE_ENV"

# 🔍 ENHANCED: Pre-build verification of source files
RUN echo "🕵️ Pre-build verification - checking for localhost references in source..."
RUN find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
    grep -v node_modules | \
    xargs grep -l "localhost:3001" 2>/dev/null | head -5 || echo "✅ No localhost:3001 references found in source"

# Build the application
RUN npm run build

# 🔍 ENHANCED: Post-build verification
RUN echo "🕵️ Post-build verification - checking compiled JavaScript..."
RUN find /app/.next -name "*.js" -exec grep -l "localhost:3001" {} \; 2>/dev/null | head -3 || echo "✅ No localhost:3001 in compiled JS"
RUN find /app/.next -name "*.js" -exec grep -l "api-codilio.sbugarin.com" {} \; 2>/dev/null | head -1 && echo "✅ Production API URL found in compiled JS" || echo "⚠️ Production API URL not found"

# Production image, copy all files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 🌐 PRODUCTION Environment Variables - these will be overriden by docker-compose
ENV NEXT_PUBLIC_API_URL=https://api-codilio.sbugarin.com/api
ENV API_URL=http://backend:3001/api
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install curl, wget and dumb-init for health checks and proper signal handling
RUN apk add --no-cache curl wget dumb-init

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 🚀 ENHANCED: Create startup script BEFORE switching to nextjs user
RUN echo '#!/bin/sh' > /app/startup.sh && \
    echo 'echo "🚀 Starting Codilio Frontend"' >> /app/startup.sh && \
    echo 'echo "🔗 Client API URL: $NEXT_PUBLIC_API_URL"' >> /app/startup.sh && \
    echo 'echo "🔗 Server API URL: $API_URL"' >> /app/startup.sh && \
    echo 'echo "🌐 Environment: $NODE_ENV"' >> /app/startup.sh && \
    echo 'echo "🔧 Port: $PORT"' >> /app/startup.sh && \
    echo 'echo "🔧 Hostname: $HOSTNAME"' >> /app/startup.sh && \
    echo 'echo "🕵️ Runtime verification..."' >> /app/startup.sh && \
    echo 'find /app -name "*.js" -exec grep -l "localhost:3001" {} \; 2>/dev/null | head -3 || echo "✅ No localhost:3001 in runtime files"' >> /app/startup.sh && \
    echo 'find /app -name "*.js" -exec grep -l "api-codilio.sbugarin.com" {} \; 2>/dev/null | head -1 >/dev/null && echo "✅ Production API URL present" || echo "⚠️ Production API URL check"' >> /app/startup.sh && \
    echo 'echo "🚀 Starting Next.js server with dumb-init..."' >> /app/startup.sh && \
    echo 'exec node server.js' >> /app/startup.sh && \
    chmod +x /app/startup.sh

# Copy necessary files
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 🔧 KRITIČNO: Change ownership of startup.sh to nextjs user
RUN chown nextjs:nodejs /app/startup.sh

# NOW switch to nextjs user
USER nextjs

EXPOSE 3000

# Enhanced health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["/app/startup.sh"]
