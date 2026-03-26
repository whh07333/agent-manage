import { test, expect } from '@playwright/test';

test('项目详情按钮：验证点击功能', async ({ page, context }) => {
  // 设置Token
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQzNjU1ODIsImV4cCI6MTc3NDk3MzI3OX0.csZTqW8J3EIAuIRLXRAC_XUU1t8d-zuo8YO7HApJP3g';
  await context.addInitScript((t) => localStorage.setItem('token', t), token);
  
  console.log('=== 开始测试详情按钮点击 ===');
  
  // 访问项目列表页
  await page.goto('http://localhost:5173/projects');
  await page.waitForTimeout(3000);
  
  // 检查详情按钮是否存在
  const detailButtons = page.locator('button:has-text("详情")');
  const count = await detailButtons.count();
  
  console.log(`找到 ${count} 个详情按钮`);
  
  if (count === 0) {
    console.log('❌ 未找到详情按钮');
    await page.screenshot({ path: 'test-results/no-detail-buttons.png', fullPage: true });
    throw new Error('未找到详情按钮');
  }
  
  // 点击第一个详情按钮
  console.log('点击第一个详情按钮...');
  await detailButtons.first().click();
  await page.waitForTimeout(2000);
  
  // 检查页面变化
  const currentUrl = page.url();
  console.log('当前URL:', currentUrl);
  
  // 检查是否有模态框或抽屉
  const modalVisible = await page.locator('.ant-modal').count();
  const drawerVisible = await page.locator('.ant-drawer').count();
  
  console.log(`模态框数量: ${modalVisible}`);
  console.log(`抽屉数量: ${drawerVisible}`);
  
  // 检查是否有错误消息
  const errorMsg = page.locator('.ant-message-error');
  if (await errorMsg.count() > 0) {
    const errorText = await errorMsg.first().textContent();
    console.log('❌ 发现错误消息:', errorText);
    await page.screenshot({ path: 'test-results/detail-click-error.png', fullPage: true });
    throw new Error(`详情点击后出现错误: ${errorText}`);
  }
  
  // 截图
  await page.screenshot({ path: 'test-results/after-detail-click.png', fullPage: true });
  
  console.log('✅ 详情按钮点击完成');
});
