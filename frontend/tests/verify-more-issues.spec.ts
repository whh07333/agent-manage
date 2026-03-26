import { test } from '@playwright/test';

test('核实：检查统计分析页面是否有统计卡片', async ({ page, context }) => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQzNjU1ODIsImV4cCI6MTc3NDk3MzI3OX0.csZTqW8J3EIAuIRLXRAC_XUU1t8d-zuo8YO7HApJP3g';
  await context.addInitScript((t) => localStorage.setItem('token', t), token);
  
  await page.goto('http://localhost:5173/statistics');
  await page.waitForTimeout(5000);
  
  // 检查统计卡片
  const statCards = page.locator('.ant-card');
  const count = await statCards.count();
  
  console.log(`统计卡片数量: ${count}`);
  
  if (count > 0) {
    console.log('✅ 统计卡片存在');
  } else {
    console.log('❌ 统计卡片不存在');
    await page.screenshot({ path: 'test-results/no-stat-cards-statistics.png', fullPage: true });
  }
});

test('核实：检查项目详情页跳转', async ({ page, context }) => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQzNjU1ODIsImV4cCI6MTc3NDk3MzI3OX0.csZTqW8J3EIAuIRLXRAC_XUU1t8d-zuo8YO7HApJP3g';
  await context.addInitScript((t) => localStorage.setItem('token', t), token);
  
  await page.goto('http://localhost:5173/projects');
  await page.waitForTimeout(3000);
  
  // 点击第一个项目名称
  const projectNames = page.locator('.ant-typography');
  const firstProject = projectNames.first();
  
  console.log('点击第一个项目名称...');
  await firstProject.click();
  
  // 等待跳转
  await page.waitForTimeout(3000);
  
  const currentUrl = page.url();
  console.log('当前URL:', currentUrl);
  
  if (currentUrl.includes('/projects/')) {
    console.log('✅ 跳转到项目详情页成功');
  } else {
    console.log('❌ 跳转失败');
    await page.screenshot({ path: 'test-results/detail-redirect-failed.png', fullPage: true });
  }
});
