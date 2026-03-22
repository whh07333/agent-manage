/**
 * 追加提取最新消息 2026-03-17 23:12 到 2026-03-18 00:51 北京时间
 */

const fs = require('fs');
const readline = require('readline');

const targetChatId = 'oc_38c1261be609040cae29fb8154c07553';
const startTime = 1773760320000;   // 2026-03-17 23:12:00 GMT+8
const endTime = 1773766260000;     // 2026-03-18 00:51:00 GMT+8
const logFiles = [
  '/tmp/openclaw/openclaw-2026-03-17.log'
];
const outputFile = '/Users/whh073/.openclaw/project/AgentManage/group-chat-history-20260316-20260317.jsonl';

let outputCount = 0;
const writeStream = fs.createWriteStream(outputFile, { flags: 'a' });

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
        const messageText = parsed['1'] || '';
        if (messageText.includes('Feishu[') && messageText.includes('message in group')) {
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
      continue;
    }
  }
}

async function main() {
  console.log(`Appending extraction...
Target chat: ${targetChatId}
Time range (Beijing Time): 2026-03-17 23:12 -> 2026-03-18 00:51
`);

  for (const file of logFiles) {
    await processLogFile(file);
  }

  writeStream.end();
  console.log(`\nAppend complete.
Added messages: ${outputCount}
Output file: ${outputFile}
`);
  
  const stats = fs.statSync(outputFile);
  console.log(`Final file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(console.error);
