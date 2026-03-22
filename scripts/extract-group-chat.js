/**
 * 从OpenClaw日志中提取指定群聊的消息
 * 提取时间范围：2026-03-16 00:00:00 到 2026-03-17 22:11:00
 * 目标群聊: oc_38c1261be609040cae29fb8154c07553
 * 输出: project根目录/group-chat-history-20260316-20260317.jsonl
 */

const fs = require('fs');
const readline = require('readline');

const targetChatId = 'oc_38c1261be609040cae29fb8154c07553';
const startTime = 1773628800000; // 2026-03-16 00:00:00 GMT+8
const endTime = 1773747060000;   // 2026-03-17 22:11:00 GMT+8
const logFiles = [
  '/tmp/openclaw/openclaw-2026-03-16.log',
  '/tmp/openclaw/openclaw-2026-03-17.log'
];
const outputFile = '/Users/whh073/.openclaw/project/AgentManage/group-chat-history-20260316-20260317.jsonl';

let outputCount = 0;
const writeStream = fs.createWriteStream(outputFile);

async function processLogFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (!line.includes(targetChatId)) {
      continue;
    }

    try {
      const parsed = JSON.parse(line);
      const logTime = new Date(parsed.time).getTime();
      
      if (logTime >= startTime && logTime <= endTime) {
        // 尝试提取消息内容
        const messageText = parsed['1'] || '';
        if (messageText.includes('Feishu[') && messageText.includes('message in group')) {
          // 这是实际消息日志格式
          const msgMatch = messageText.match(/Feishu\[[^\]]+\]: (.*)$/);
          if (msgMatch) {
            const output = {
              timestamp: parsed.time,
              timestampMs: logTime,
              chatId: targetChatId,
              message: msgMatch[1],
              sourceLog: parsed
            };
            writeStream.write(JSON.stringify(output) + '\n');
            outputCount++;
          }
        } else if (messageText.includes('received message from') && messageText.includes('oc_38c1261')) {
          // 接收日志也保留
          const output = {
            timestamp: parsed.time,
            timestampMs: logTime,
            chatId: targetChatId,
            event: 'received_message',
            rawText: messageText,
            sourceLog: parsed
          };
          writeStream.write(JSON.stringify(output) + '\n');
          outputCount++;
        }
      }
    } catch (e) {
      // 解析失败，跳过
      continue;
    }
  }
}

async function main() {
  console.log(`Starting extraction...
Target chat: ${targetChatId}
Time range: ${new Date(startTime).toISOString()} -> ${new Date(endTime).toISOString()}
`);

  for (const file of logFiles) {
    await processLogFile(file);
  }

  writeStream.end();
  console.log(`\nExtraction complete.
Total messages extracted: ${outputCount}
Output file: ${outputFile}
`);
}

main().catch(console.error);
