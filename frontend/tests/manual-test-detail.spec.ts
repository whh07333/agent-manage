import { test } from '@playwright/test';

test('手动测试：点击项目名称并截屏', async ({ page, context }) => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQzNjU1ODIsImV4cCI6MTc3NDk3MzI3OX0.csZTqW8J3EIAuIRLXRAC_XUU1t8d-zuo8YO7HApJP3g';
  await context.addInitScript((t) => localStorage.setItem('token', t), token);
  
  await page.goto('http://localhost:5173/projects');
  await page.waitForTimeout(5000);
  
  console.log('页面加载完成');
  
  // 等待更长时间
  await page.waitForTimeout(10000);
  
  // 截图
  await page.screenshot({ path: 'test-results/manual-test.png', fullPage: true });
  
  console.log('✅ 截图完成');
});
