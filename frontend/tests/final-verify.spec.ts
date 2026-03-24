import { test, expect } from '@playwright/test';

test('完整验证：项目列表必须显示', async ({ page, context }) => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQzNjU1ODIsImV4cCI6MTc3NDk3MDM4Mn0.0nQtGwSmuow9mmEQgukL2pAJ_8Og_bYKkxYsMtCFHwY';
  
  await context.addInitScript((t) => localStorage.setItem('token', t), token);
  
  await page.goto('http://localhost:5173/projects');
  
  // 等待页面完全加载
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  await page.waitForTimeout(3000);
  
  // 验证项目列表
  const listItems = page.locator('.ant-list-item');
  const count = await listItems.count();
  
  console.log('=== 项目列表验证 ===');
  console.log('列表项数量:', count);
  
  // 截图保存
  await page.screenshot({ path: 'final-verify-list.png', fullPage: true });
  
  // 至少应该有项目（数据库有18个）
  expect(count).toBeGreaterThan(0);
  
  console.log('✅ 项目列表验证通过！');
});
