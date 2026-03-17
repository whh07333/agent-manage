#!/bin/bash
# 每分钟递增写入计数器到联调异常记录文件
FILE="/Users/whh073/.openclaw/project/AgentManage/ProFile/会话记录/2026-03-15-前后端联调异常记录.md"
COUNTER_FILE="/tmp/联调计数器.txt"

# 初始化计数器
if [ ! -f "$COUNTER_FILE" ]; then
  echo 0 > "$COUNTER_FILE"
fi

# 读取当前计数器值
COUNT=$(cat "$COUNTER_FILE")
COUNT=$((COUNT + 1))

# 写入新的计数器值
echo "$COUNT" > "$COUNTER_FILE"

# 追加到文件末尾（如果文件不存在则创建）
echo "定时写入测试: $COUNT - $(date '+%Y-%m-%d %H:%M:%S')" >> "$FILE"

echo "已写入: $COUNT"
