import { test } from '@playwright/test';

test('调试：项目名称点击事件', async ({ page }) => {
  console.log('=== 调试：项目名称点击事件 ===');
  
  await page.goto('http://localhost:5173/projects');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  const projectNames = page.locator('.ant-list-item .ant-card-meta-title span');
  const count = await projectNames.count();
  console.log(`✓ 找到 ${count} 个项目名称`);
  
  const firstSpanHtml = await projectNames.first().innerHTML();
  console.log(`✓ HTML: ${firstSpanHtml}`);
  
  try {
    await projectNames.first().click();
    await page.waitForTimeout(3000);
    
    const url = page.url();
    console.log(`✓ 点击后URL: ${url}`);
  } catch (error) {
    console.log(`❌ 点击失败: ${error}`);
  }
});
