import { test, expect } from '@playwright/test';

test('项目列表 - 验证数据加载', async ({ page, context }) => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQzNjU1ODIsImV4cCI6MTc3NDk3MDM4Mn0.0nQtGwSmuow9mmEQgukL2pAJ_8Og_bYKkxYsMtCFHwY';
  await context.addInitScript((t) => localStorage.setItem('token', t), token);
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('fetchData') || text.includes('response') || text.includes('code') || text.includes('列表项')) {
      console.log('日志:', text);
    }
  });
  
  await page.goto('http://localhost:5173/projects');
  await page.waitForTimeout(3000);
  
  const items = page.locator('.ant-list-item');
  const count = await items.count();
  console.log('列表项数量:', count);
});
