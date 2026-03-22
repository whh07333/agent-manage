#!/usr/bin/env node
/**
 * 提取群聊完整对话到结构化 JSONL
 * 用法: node scripts/extract-full-group-chat.js <chat-id> [output-file]
 */

const fs = require('fs');
const path = require('path');

const chatId = process.argv[2];
let outputFile = process.argv[3];

if (!chatId) {
  console.error('用法: node scripts/extract-full-group-chat.js <chat-id> [output-file]');
  console.error('示例: node scripts/extract-full-group-chat.js oc_38c1261be609040cae29fb8154c07553');
  process.exit(1);
}

if (!outputFile) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  outputFile = path.join(
    '/Users/whh073/.openclaw/project/AgentManage',
    `group-chat-full-${chatId}-${timestamp}.jsonl`
  );
}

console.log(`开始提取群聊完整对话: ${chatId}`);
console.log(`输出文件: ${outputFile}`);

const agentsDir = path.join(process.env.HOME, '.openclaw', 'agents');
let totalMessages = 0;

// 创建写入流
const writeStream = fs.createWriteStream(outputFile);

// 遍历所有agent目录
function processAgentDir(agentDir) {
  const sessionsDir = path.join(agentDir, 'sessions');
  if (!fs.existsSync(sessionsDir)) {
    return;
  }

  const sessionFiles = fs.readdirSync(sessionsDir)
    .filter(f => f.endsWith('.jsonl'));

  for (const sessionFile of sessionFiles) {
    const sessionPath = path.join(sessionsDir, sessionFile);
    try {
      const content = fs.readFileSync(sessionPath, 'utf8');
      const lines = content.split('\n').filter(l => l.trim());

      // 检查这个会话是否属于目标群聊
      const isTargetChat = lines.some(line => {
        try {
          const data = JSON.parse(line);
          return data.chatId === chatId || 
                 (data.deliveryContext && data.deliveryContext.chatId === chatId) ||
                 (JSON.stringify(data).includes(chatId));
        } catch(e) {
          return line.includes(chatId);
        }
      });

      if (isTargetChat && lines.length > 0) {
        const agentName = path.basename(agentDir);
        console.log(`  处理会话: ${agentName}/${sessionFile} (${lines.length} 行)`);

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            // 添加agent信息
            data._extractedAgent = agentName;
            data._extractedFrom = sessionFile;
            writeStream.write(JSON.stringify(data) + '\n');
            totalMessages++;
          } catch(e) {
            // 不是JSON，直接写入
            writeStream.write(JSON.stringify({
              raw: line,
              _extractedAgent: agentName,
              _extractedFrom: sessionFile,
              _parseError: e.message
            }) + '\n');
            totalMessages++;
  }
        }
      }
    } catch(e) {
      console.error(`  错误处理 ${sessionPath}: ${e.message}`);
    }
  }
}

// 主流程
try {
  const agentDirs = fs.readdirSync(agentsDir)
    .map(d => path.join(agentsDir, d))
    .filter(d => fs.statSync(d).isDirectory());

  console.log(`找到 ${agentDirs.length} 个agent目录`);

  for (const agentDir of agentDirs) {
    processAgentDir(agentDir);
  }

  writeStream.end();

  console.log('\n✅ 提取完成!');
  console.log(`   总消息数: ${totalMessages}`);
  console.log(`   输出文件: ${outputFile}`);
  const stat = fs.statSync(outputFile);
  console.log(`   文件大小: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);

} catch(e) {
  console.error('Fatal error:', e);
  process.exit(1);
}
