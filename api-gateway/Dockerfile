# Stage 1: Builder (Cài đặt và chuẩn bị)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .

# Stage 2: Runner (Chỉ chứa những gì cần để chạy)
FROM node:20-alpine
# Thiết lập môi trường production để các lib tối ưu hiệu năng
ENV NODE_ENV=production
WORKDIR /app

# Chỉ copy node_modules và source code từ stage builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src

EXPOSE 3000
CMD ["node", "src/server.js"]