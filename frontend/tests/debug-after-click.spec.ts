import { test } from '@playwright/test';

test('debug after click', async ({ page }) => {
  await page.goto('http://localhost:5173', {
    waitUntil: 'networkidle',
    timeout: 15000,
  });

  // 设置token
  await page.evaluate(() => {
    window.localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlhdCI6MTc3NDE5MzgxOCwiZXhwIjoxODA1NzUxNDg4fQ.U8O9DYSacgW2INc8bbn6eDLpnbDcg');
  });
  await page.reload({ waitUntil: 'networkidle' });
  
  // 点击侧边导航的"项目管理"
  await page.locator('.ant-menu span.ant-menu-title-content').getByText('项目管理').click({ timeout: 5000 });
  await page.waitForTimeout(5000);
  
  // 获取所有可见文本
  const textContent = await page.textContent('body');
  console.log('=== 点击后页面所有文本 ===');
  console.log(textContent);
  console.log('=== 结束 ===');
  console.log('');
  console.log('包含"创建项目"?:', textContent.includes('创建项目'));
  
  // 打印所有按钮文本
  const buttons = await page.locator('button').allTextContents();
  console.log('');
  console.log('所有按钮文本:', buttons);
});
