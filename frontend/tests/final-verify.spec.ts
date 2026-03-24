import { test, expect } from '@playwright/test';

test('最终验证：使用环境变量token加载项目列表', async ({ page }) => {
  // 监听API请求
  const apiCalls: any[] = [];
  page.on('request', request => {
    if (request.url().includes('/api/projects')) {
      apiCalls.push({
        url: request.url(),
        method: request.method(),
        hasToken: !!request.headers()['authorization']
      });
    }
  });
  
  // 监听响应
  const responses: any[] = [];
  page.on('response', response => {
    if (response.url().includes('/api/projects')) {
      responses.push({
        url: response.url(),
        status: response.status()
      });
    }
  });
  
  // 监听控制台
  const logs: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('API') || text.includes('error') || text.includes('401') || text.includes('500')) {
      logs.push(text);
    }
  });
  
  await page.goto('http://localhost:5173/projects');
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  await page.waitForTimeout(2000);
  
  console.log('=== 验证结果 ===');
  console.log('API请求数量:', apiCalls.length);
  console.log('API响应数量:', responses.length);
  console.log('有Token的请求数量:', apiCalls.filter(r => r.hasToken).length);
  console.log('控制台错误数量:', logs.length);
  
  // 检查列表项
  const listItems = page.locator('.ant-list-item');
  const count = await listItems.count();
  console.log('列表项数量:', count);
  
  await page.screenshot({ path: 'final-result.png', fullPage: true });
  
  // 验证
  expect(apiCalls.length).toBeGreaterThan(0);
  expect(count).toBeGreaterThan(0);
  console.log('✅ 验证通过！');
});
