#!/bin/bash

echo "🚀 Starting PixShare Frontend..."

cd frontend

# Cài đặt dependencies nếu chưa có
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build production
echo "🔨 Building frontend..."
npm run build

# Chạy production server
echo "▶️  Starting frontend on port 3006..."
npm start

# Hoặc dùng dev mode
# npm run dev
