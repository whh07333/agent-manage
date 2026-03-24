import { test } from '@playwright/test';

test('get page content', async ({ page }) => {
  // 设置token
  await page.goto('http://localhost:5173/projects', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  
  // 注入token到localStorage
  await page.evaluate(() => {
    window.localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlhdCI6MTc3NDE5MzgxOCwiZXhwIjoxODA1NzUxNDg4fQ.U8O9DYSacgW2INc8bbn6eDLpnbDcg');
  });
  
  // 刷新页面
  await page.reload({
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  
  await page.waitForTimeout(5000);
  
  // 获取整个页面文本
  const textContent = await page.textContent('body');
  console.log('=== 页面文本内容 ===');
  console.log(textContent);
  console.log('=== 结束 ===');
  console.log('');
  console.log('包含"创建项目"?:', textContent.includes('创建项目'));
  console.log('包含"项目管理"?:', textContent.includes('项目管理'));
});
