# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Kopiraj dependencies i instaliraj
COPY package*.json ./
RUN npm install

# Kopiraj sve ostalo i build-uj + export
COPY . .
RUN npm run build

# Production stage (serve preko nginx)
FROM nginx:alpine

# Kopiraj statički eksportovane fajlove u nginx root
COPY --from=builder /app/out /usr/share/nginx/html

# Otvori port 80
EXPOSE 80

# Pokreni nginx
CMD ["nginx", "-g", "daemon off;"]
