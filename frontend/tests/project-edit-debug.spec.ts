import { test, expect } from '@playwright/test';

test('调试：检查页面内容', async ({ page, context }) => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQzNjU1ODIsImV4cCI6MTc3NDk3MzI3OX0.csZTqW8J3EIAuIRLXRAC_XUU1t8d-zuo8YO7HApJP3g';
  await context.addInitScript((t) => localStorage.setItem('token', t), token);
  
  await page.goto('http://localhost:5173/projects');
  await page.waitForTimeout(5000);
  
  // 检查页面内容
  const buttons = page.locator('button');
  const buttonCount = await buttons.count();
  console.log(`页面上总共有 ${buttonCount} 个按钮`);
  
  // 获取所有按钮的文本
  for (let i = 0; i < Math.min(buttonCount, 30); i++) {
    const text = await buttons.nth(i).textContent();
    console.log(`按钮 ${i}: ${text}`);
  }
  
  // 检查列表项
  const listItems = page.locator('.ant-list-item');
  const listCount = await listItems.count();
  console.log(`列表项数量: ${listCount}`);
});
