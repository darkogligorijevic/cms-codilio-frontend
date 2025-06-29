# 1. Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# 2. Production stage
FROM node:18-alpine

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001

WORKDIR /app

COPY --from=builder --chown=nextjs:nodejs /app ./

USER nextjs

ENV NODE_ENV=production
EXPOSE 3000

CMD ["dumb-init", "npm", "run", "start"]

