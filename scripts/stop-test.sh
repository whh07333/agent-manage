#!/bin/bash
# 停止测试环境

echo "🛑 Stopping test environment..."

# 停止后端和前端进程
pkill -f "node.*dist/server.js.*3001" 2>/dev/null
pkill -f "vite.*5174" 2>/dev/null

# 测试数据库保持运行，不需要每次停止
echo "✅ Test environment stopped (database kept running)"
