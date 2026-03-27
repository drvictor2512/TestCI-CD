# Stage 1: Build (Cài đặt dependencies và build code)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Production (Chỉ lấy những gì cần thiết để chạy)
FROM node:20-alpine
WORKDIR /app
# Chỉ copy file config và thư mục build/modules từ Stage 1
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app . 

EXPOSE 3001
CMD ["npm", "run", "start"]