import { test } from '@playwright/test';

test('检查项目列表显示', async ({ page, context }) => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQzNjU1ODIsImV4cCI6MTc3NDk3MzI3OX0.csZTqW8J3EIAuIRLXRAC_XUU1t8d-zuo8YO7HApJP3g';
  await context.addInitScript((t) => localStorage.setItem('token', t), token);
  
  await page.goto('http://localhost:5173/projects');
  await page.waitForTimeout(5000);
  
  const listItems = page.locator('.ant-list-item');
  const count = await listItems.count();
  
  console.log(`列表项数量: ${count}`);
  
  if (count === 0) {
    await page.screenshot({ path: 'test-results/no-projects.png', fullPage: true });
    throw new Error('未找到项目');
  }
  
  await page.screenshot({ path: 'test-results/projects-displayed.png', fullPage: true });
  console.log('✅ 项目列表正常显示');
});
