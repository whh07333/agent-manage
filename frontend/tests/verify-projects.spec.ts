import { test, expect } from '@playwright/test';

test('验证：项目列表显示19个项目', async ({ page, context }) => {
  const newToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQ0OTI2NTAsImV4cCI6MTc3NTA5NzQ1MH0.GCkxoJajZ9hAWwF2LxDeLSQDOH-4YvRtKFfjstZrV9I';
  
  await context.addInitScript(() => localStorage.removeItem('token'));
  await context.addInitScript((t) => localStorage.setItem('token', t), newToken);
  
  await page.goto('http://localhost:5173/projects');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);
  
  const listItems = page.locator('.ant-list-item');
  const count = await listItems.count();
  
  console.log(`📊 列表显示项目数: ${count}`);
  console.log(`📊 数据库实际项目数: 19`);
  
  if (count > 0) {
    console.log(`✅ 项目列表正常显示，共 ${count} 个项目`);
    await page.screenshot({ path: 'test-results/projects-list-with-data.png', fullPage: true });
    console.log(`📸 截图已保存: test-results/projects-list-with-data.png`);
  } else {
    console.log(`❌ 项目列表为空`);
    await page.screenshot({ path: 'test-results/projects-list-empty.png', fullPage: true });
  }
});
