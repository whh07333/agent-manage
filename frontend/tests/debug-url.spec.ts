import { test, expect } from '@playwright/test';

test('debug url and rendering', async ({ page }) => {
  await page.goto('http://localhost:5173', {
    waitUntil: 'networkidle',
    timeout: 15000,
  });

  // 设置token
  await page.evaluate(() => {
    window.localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlhdCI6MTc3NDE5MzgxOCwiZXhwIjoxODA1NzUxNDg4fQ.U8O9DYSacgW2INc8bbn6eDLpnbDcg');
  });
  await page.reload({ waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);

  console.log('Current URL after load:', page.url());
  console.log('Has "项目管理" in menu:', await page.getByText('项目管理').isVisible());

  // 点击项目管理
  await page.locator('.ant-menu span.ant-menu-title-content').getByText('项目管理').click({ timeout: 5000 });
  await page.waitForTimeout(8000);
  await page.waitForLoadState('networkidle');

  console.log('Current URL after click:', page.url());
  
  const url = page.url();
  console.log('URL ends with /projects:', url.endsWith('/projects'));
  
  const content = await page.content();
  console.log('Contains 404:', content.includes('404') && content.includes('No Found'));
  console.log('Contains "创建项目":', content.includes('创建项目'));
  
  // 输出HTML结构中ProjectList相关
  if (content.includes('ProjectList')) {
    console.log('✓ Found ProjectList component reference');
  }
});
