import { test } from '@playwright/test';

test('检查：浏览器中的环境变量', async ({ page }) => {
  console.log('🔍 检查浏览器中的实际环境变量...\n');
  
  await page.goto('http://localhost:5173');
  
  // 检查环境变量
  const envVars = await page.evaluate(() => {
    return {
      viteDefaultToken: import.meta.env.VITE_DEFAULT_TOKEN,
      viteDefaultTokenLength: import.meta.env.VITE_DEFAULT_TOKEN?.length || 0,
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD
    };
  });
  
  console.log('📊 环境变量检查:');
  console.log(`- VITE_DEFAULT_TOKEN: ${envVars.viteDefaultToken ? '存在' : '不存在'}`);
  console.log(`- 长度: ${envVars.viteDefaultTokenLength}`);
  console.log(`- MODE: ${envVars.mode}`);
  console.log(`- DEV: ${envVars.dev}`);
  console.log(`- PROD: ${envVars.prod}`);
  
  // 检查localStorage
  const localStorageData = await page.evaluate(() => {
    return {
      token: localStorage.getItem('token'),
      tokenLength: localStorage.getItem('token')?.length || 0
    };
  });
  
  console.log('\n📦 localStorage检查:');
  console.log(`- token: ${localStorageData.token ? '存在' : '不存在'}`);
  console.log(`- 长度: ${localStorageData.tokenLength}`);
  
  // 监控网络请求
  console.log('\n🌐 加载项目列表并监控请求...');
  
  let requestToken = '';
  let responseStatus = 0;
  let responseBody = '';
  
  page.on('request', (request) => {
    if (request.url().includes('/api/projects')) {
      const authHeader = request.headers()['authorization'];
      console.log(`请求Authorization: ${authHeader?.substring(0, 50)}...`);
      requestToken = authHeader?.replace('Bearer ', '') || '';
    }
  });
  
  page.on('response', async (response) => {
    if (response.url().includes('/api/projects')) {
      responseStatus = response.status();
      responseBody = await response.text();
      console.log(`响应状态: ${responseStatus}`);
      console.log(`响应body: ${responseBody.substring(0, 200)}...`);
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
    console.log('❓ 使用的token:');
    console.log(requestToken.substring(0, 50) + '...');
    console.log(`长度: ${requestToken.length}`);
  }
});
