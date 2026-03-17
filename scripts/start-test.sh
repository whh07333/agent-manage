#!/bin/bash
# 启动测试环境
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT=$(dirname "$SCRIPT_DIR")

echo "🚀 Starting test environment..."

# 启动测试数据库
cd "$PROJECT_ROOT"
docker-compose up -d postgres-test

echo "⏳ Waiting for database to be ready..."
sleep 5

# 启动测试后端
cd "$PROJECT_ROOT/backend"
cp .env.test .env
npm run build
npm run start &
echo "✅ Backend started on port 3001"

# 启动测试前端
cd "$PROJECT_ROOT/frontend"
cp .env.test .env.development
npm run dev -- --port 5174 &
echo "✅ Frontend started on port 5174"

echo ""
echo "🎉 Test environment ready!"
echo "   Frontend: http://localhost:5174"
echo "   Backend: http://localhost:3001"
echo "   Database: localhost:5434/agentmanage_test"
