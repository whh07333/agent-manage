#!/bin/bash
# 完整群聊备份脚本
# 功能：从 OpenClaw 会话文件中提取完整对话内容保存为 JSONL
# 使用: ./scripts/backup-full-group-chat.sh <chat-id> [output-file]

CHAT_ID="$1"
OUTPUT_FILE="$2"

if [ -z "$CHAT_ID" ]; then
  echo "用法: ./scripts/backup-full-group-chat.sh <chat-id> [output-file]"
  echo "示例: ./scripts/backup-full-group-chat.sh oc_38c1261be609040cae29fb8154c07553"
  exit 1
fi

if [ -z "$OUTPUT_FILE" ]; then
  OUTPUT_FILE="/Users/whh073/.openclaw/project/AgentManage/group-chat-full-$(date +%Y%m%d-%H%M%S).jsonl"
fi

echo "开始备份群聊: $CHAT_ID"
echo "输出文件: $OUTPUT_FILE"

# 创建输出文件
> "$OUTPUT_FILE"

# 遍历所有agent的会话文件，提取该群聊的完整消息
for AGENT_DIR in ~/.openclaw/agents/*; do
  if [ ! -d "$AGENT_DIR/sessions" ]; then
    continue
  fi
  for SESSION_FILE in "$AGENT_DIR"/sessions/*.jsonl; do
    if [ ! -f "$SESSION_FILE" ]; then
      continue
    fi
    # 检查这个会话是否属于目标群聊
    # 通过第一行判断chatId
    FIRST_LINE=$(head -1 "$SESSION_FILE" 2>/dev/null)
    if echo "$FIRST_LINE" | grep -q "$CHAT_ID"; then
      echo "  处理会话: $SESSION_FILE"
      # 提取所有消息，追加到输出
      while IFS= read -r line; do
        if [ -n "$line" ]; then
          # 尝试解析JSON，提取关键信息
          # 保存完整行
          echo "$line" >> "$OUTPUT_FILE"
        fi
      done < "$SESSION_FILE"
    fi
  done
done

echo "备份完成! 文件: $OUTPUT_FILE"
echo "行数: $(wc -l < "$OUTPUT_FILE")"
echo "大小: $(du -h "$OUTPUT_FILE")"
