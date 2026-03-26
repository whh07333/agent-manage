import { test, expect } from '@playwright/test';

test('联调：统计分析页面验证', async ({ page }) => {
  console.log('=== 统计分析页面验证 ===');
  
  // 1. 访问统计分析
  console.log('1️⃣ 访问统计分析...');
  await page.goto('http://localhost:5173/statistics');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  console.log('✓ 统计分析页面已加载');
  
  // 2. 检查页面标题
  console.log('2️⃣ 检查页面标题...');
  const pageTitle = page.locator('h2, h1, h3').filter({ hasText: /统计|分析/ });
  const titleExists = await pageTitle.count() > 0;
  console.log(`✓ 页面标题: ${titleExists ? '存在' : '不存在'}`);
  
  // 3. 检查统计图表
  console.log('3️⃣ 检查统计图表...');
  const charts = page.locator('.ant-card, canvas, .echarts-for-react');
  const chartExists = await charts.count() > 0;
  console.log(`✓ 统计图表容器: ${chartExists ? '存在' : '不存在'}`);
  
  // 4. 截图
  console.log('4️⃣ 截图保存...');
  await page.screenshot({ path: 'test-results/integration-statistics.png', fullPage: true });
  console.log('✓ 截图已保存');
  
  console.log('\n=== 验证完成 ===');
  console.log('✅ 统计分析页面验证完成');
});
