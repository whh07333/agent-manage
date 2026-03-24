import { test, expect } from '@playwright/test';

test('项目列表 - 验证数据加载', async ({ page, context }) => {
  // 设置 token 在 context 级别
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQzNjU1ODIsImV4cCI6MTc3NDk3MDM4Mn0.0nQtGwSmuow9mmEQgukL2pAJ_8Og_bYKkxYsMtCFHwY';
  await context.addInitScript((t) => localStorage.setItem('token', t), token);
  
  // 监听控制台
  page.on('console', msg => {
    if (msg.text().includes('fetchData') || msg.text().includes('response') || msg.text().includes('列表项数量')) {
      console.log('浏览器日志:', msg.text());
    }
  });
  
  await page.goto('http://localhost:5173/projects');
  
  // 等待页面加载
  await page.waitForTimeout(3000);
  
  // 检查列表项数量
  const items = page.locator('.ant-list-item');
  const count = await items.count();
  
  console.log('列表项数量:', count);
  expect(count).toBeGreaterThan(0);
});
