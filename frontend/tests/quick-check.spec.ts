import { test } from '@playwright/test';

test('快速检查：使用新Token检查项目列表', async ({ page, context }) => {
  const newToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQzNjU1ODIsImV4cCI6MTc3NDk3MzI3OX0.csZTqW8J3EIAuIRLXRAC_XUU1t8d-zuo8YO7HApJP3g';
  
  // 先清除旧的token
  await context.addInitScript(() => localStorage.removeItem('token'));
  
  // 设置新token
  await context.addInitScript((t) => localStorage.setItem('token', t), newToken);
  
  await page.goto('http://localhost:5173/projects');
  await page.waitForTimeout(5000);
  
  const listItems = page.locator('.ant-list-item');
  const count = await listItems.count();
  
  console.log(`列表项数量: ${count}`);
  
  if (count > 0) {
    console.log('✅ 项目列表有数据');
  } else {
    console.log('❌ 项目列表为空');
    await page.screenshot({ path: 'test-results/empty-list-new-token.png', fullPage: true });
  }
});
