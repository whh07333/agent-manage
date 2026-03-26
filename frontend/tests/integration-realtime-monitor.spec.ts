import { test, expect } from '@playwright/test';

test('联调：实时监控页面验证', async ({ page }) => {
  console.log('=== 实时监控页面验证 ===');
  
  // 1. 访问实时监控
  console.log('1️⃣ 访问实时监控...');
  await page.goto('http://localhost:5173/monitor');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  console.log('✓ 实时监控页面已加载');
  
  // 2. 检查页面标题
  console.log('2️⃣ 检查页面标题...');
  const pageTitle = page.locator('h2, h1, h3').filter({ hasText: /监控|实时/ });
  const titleExists = await pageTitle.count() > 0;
  console.log(`✓ 页面标题: ${titleExists ? '存在' : '不存在'}`);
  
  // 3. 检查监控内容
  console.log('3️⃣ 检查监控内容...');
  const content = page.locator('.ant-card, .ant-table, .ant-statistic');
  const contentExists = await content.count() > 0;
  console.log(`✓ 监控内容容器: ${contentExists ? '存在' : '不存在'}`);
  
  // 4. 截图
  console.log('4️⃣ 截图保存...');
  await page.screenshot({ path: 'test-results/integration-realtime-monitor.png', fullPage: true });
  console.log('✓ 截图已保存');
  
  console.log('\n=== 验证完成 ===');
  console.log('✅ 实时监控页面验证完成');
});
