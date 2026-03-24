import { test } from '@playwright/test';

test('take screenshot', async ({ page }) => {
  await page.goto('http://localhost:5173/projects', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  
  // 等待更长时间
  await page.waitForTimeout(5000);
  
  // 获取整个页面文本
  const content = await page.content();
  console.log('Page content length:', content.length);
  console.log('Has "创建项目":', content.includes('创建项目'));
  console.log('Has "项目管理":', content.includes('项目管理'));
  
  // 截图保存
  await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  console.log('Screenshot saved to error-screenshot.png');
});
