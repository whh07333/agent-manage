import { test } from '@playwright/test';

test('验证：token过期后自动切换到环境变量token', async ({ page }) => {
  console.log('🔍 测试token过期自动切换...\n');
  
  // 1. 先设置一个过期的token到localStorage
  const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2NDAwMDAwMDAsImV4cCI6MTY0MDA4NjQwMH0.invalid';
  
  await page.goto('http://localhost:5173');
  await page.evaluate((t) => localStorage.setItem('token', t), expiredToken);
  console.log('1️⃣ 设置过期token到localStorage');
  
  // 2. 监控网络请求
  let requestToken = '';
  let responseStatus = 0;
  
  page.on('request', (request) => {
    if (request.url().includes('/api/projects')) {
      const authHeader = request.headers()['authorization'];
      requestToken = authHeader?.replace('Bearer ', '') || '';
      console.log(`📤 请求token: ${requestToken.substring(0, 50)}...`);
    }
  });
  
  page.on('response', (response) => {
    if (response.url().includes('/api/projects')) {
      responseStatus = response.status();
      console.log(`📥 响应状态: ${responseStatus}`);
    }
  });
  
  // 3. 加载项目列表
  console.log('\n2️⃣ 加载项目列表页面');
  await page.goto('http://localhost:5173/projects');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // 4. 检查页面显示
  const listItems = page.locator('.ant-list-item');
  const count = await listItems.count();
  
  console.log('\n3️⃣ 检查结果');
  console.log(`页面显示项目数: ${count}`);
  
  // 5. 验证使用的token
  const fs = require('fs');
  const envFile = '/Users/whh073/.openclaw/project/AgentManage/frontend/.env.development';
  const envContent = fs.readFileSync(envFile, 'utf-8');
  const envToken = envContent.match(/VITE_DEFAULT_TOKEN=(.+)/)?.[1] || '';
  
  console.log(`\n4️⃣ Token验证:`);
  console.log(`环境变量token: ${envToken.substring(0, 50)}...`);
  console.log(`请求使用的token: ${requestToken.substring(0, 50)}...`);
  console.log(`是否一致: ${requestToken === envToken ? '✅ 是' : '❌ 否'}`);
  
  if (count > 0 && responseStatus === 200) {
    console.log('\n✅ 成功：即使localStorage有过期token，也自动切换到环境变量token');
  } else {
    console.log('\n❌ 失败：无法自动切换token');
    await page.screenshot({ path: 'test-results/token-expiry-failed.png', fullPage: true });
  }
});
