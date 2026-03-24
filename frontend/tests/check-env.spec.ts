import { test, expect } from '@playwright/test';

test('检查环境变量', async ({ page }) => {
  await page.goto('http://localhost:5173/projects');
  
  // 获取环境变量
  const token = await page.evaluate(() => {
    return (window as any).import?.meta?.env?.VITE_DEFAULT_TOKEN?.substring(0, 20) + '...';
  });
  
  console.log('Token:', token);
});
