#!/bin/bash
# 重置测试数据库
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT=$(dirname "$SCRIPT_DIR")

echo "🗑️  Resetting test database..."

# 删除并重建数据库，执行初始化脚本
docker exec -i agentmanage-test-postgres psql -U postgres -c "DROP DATABASE IF EXISTS agentmanage_test;"
docker exec -i agentmanage-test-postgres psql -U postgres -c "CREATE DATABASE agentmanage_test;"
cat "$PROJECT_ROOT/init-db.sql" | docker exec -i agentmanage-test-postgres psql -U postgres -d agentmanage_test

echo "✅ Test database reset completed."
