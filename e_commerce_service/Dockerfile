# Stage 1: Build & Install
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .

# Stage 2: Production (Image cuối cùng)
FROM node:20-alpine
WORKDIR /app
# Chỉ copy những file cần thiết từ stage builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src


EXPOSE 3002
CMD ["node", "src/server.js"]