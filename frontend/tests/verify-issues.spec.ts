import { test } from '@playwright/test';

test('核实：检查项目列表页面是否有创建按钮', async ({ page, context }) => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQzNjU1ODIsImV4cCI6MTc3NDk3MzI3OX0.csZTqW8J3EIAuIRLXRAC_XUU1t8d-zuo8YO7HApJP3g';
  await context.addInitScript((t) => localStorage.setItem('token', t), token);
  
  await page.goto('http://localhost:5173/projects');
  await page.waitForTimeout(5000);
  
  // 检查创建按钮
  const createButtons = page.locator('button:has-text("创建项目"), button:has-text("新建"), button:has-text("Create"), button:has-text("新建")');
  const count = await createButtons.count();
  
  console.log(`创建按钮数量: ${count}`);
  
  if (count > 0) {
    console.log('✅ 创建按钮存在');
    for (let i = 0; i < Math.min(count, 5); i++) {
      const text = await createButtons.nth(i).textContent();
      console.log(`  按钮${i}: ${text}`);
    }
  } else {
    console.log('❌ 创建按钮不存在');
    await page.screenshot({ path: 'test-results/no-create-button.png', fullPage: true });
  }
});

test('核实：检查实时监控页面是否有统计卡片', async ({ page, context }) => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQzNjU1ODIsImV4cCI6MTc3NDk3MzI3OX0.csZTqW8J3EIAuIRLXRAC_XUU1t8d-zuo8YO7HApJP3g';
  await context.addInitScript((t) => localStorage.setItem('token', t), token);
  
  await page.goto('http://localhost:5173/monitoring');
  await page.waitForTimeout(5000);
  
  // 检查统计卡片
  const statCards = page.locator('.ant-card');
  const count = await statCards.count();
  
  console.log(`统计卡片数量: ${count}`);
  
  if (count > 0) {
    console.log('✅ 统计卡片存在');
  } else {
    console.log('❌ 统计卡片不存在');
    await page.screenshot({ path: 'test-results/no-stat-cards.png', fullPage: true });
  }
});
