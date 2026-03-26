import { test } from '@playwright/test';

test('检查：实际使用的token和网络请求', async ({ page }) => {
  console.log('🔍 检查实际使用的token...\n');
  
  // 监控网络请求
  let requestToken = '';
  let responseStatus = 0;
  let responseBody = '';
  
  page.on('request', (request) => {
    if (request.url().includes('/api/projects')) {
      const authHeader = request.headers()['authorization'];
      console.log(`📤 请求Authorization: ${authHeader?.substring(0, 50)}...`);
      requestToken = authHeader?.replace('Bearer ', '') || '';
    }
  });
  
  page.on('response', async (response) => {
    if (response.url().includes('/api/projects')) {
      responseStatus = response.status();
      responseBody = await response.text();
      console.log(`📥 响应状态: ${responseStatus}`);
      console.log(`📥 响应body: ${responseBody.substring(0, 200)}...`);
    }
  });
  
  await page.goto('http://localhost:5173/projects');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  const listItems = page.locator('.ant-list-item');
  const count = await listItems.count();
  
  console.log('\n📊 页面显示:');
  console.log(`- 项目数量: ${count}`);
  
  if (responseStatus === 401) {
    console.log('\n❌ 发现401错误！');
    console.log(`🔑 使用的token: ${requestToken.substring(0, 50)}...`);
    console.log(`🔑 Token长度: ${requestToken.length}`);
    
    // 验证这个token是否有效
    const fs = require('fs');
    const envFile = '/Users/whh073/.openclaw/project/AgentManage/frontend/.env.development';
    const envContent = fs.readFileSync(envFile, 'utf-8');
    const envToken = envContent.match(/VITE_DEFAULT_TOKEN=(.+)/)?.[1] || '';
    
    console.log(`\n📝 环境文件中的token: ${envToken.substring(0, 50)}...`);
    console.log(`📝 环境文件长度: ${envToken.length}`);
    
    if (requestToken === envToken) {
      console.log('\n✅ 使用的是环境文件中的token');
    } else {
      console.log('\n❌ 使用的token和环境文件不一致！');
    }
  } else if (count > 0) {
    console.log('\n✅ 页面正常显示');
    const firstProject = await listItems.first().textContent();
    console.log(`第一个项目: ${firstProject?.substring(0, 50)}...`);
  }
});
