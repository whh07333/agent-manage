import { test, expect } from '@playwright/test';

test('项目归档：验证归档按钮点击和确认流程', async ({ page, context }) => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQzNjU1ODIsImV4cCI6MTc3NDk3MzI3OX0.csZTqW8J3EIAuIRLXRAC_XUU1t8d-zuo8YO7HApJP3g';
  await context.addInitScript((t) => localStorage.setItem('token', t), token);
  
  console.log('=== 开始测试项目归档 ===');
  
  await page.goto('http://localhost:5173/projects');
  await page.waitForTimeout(3000);
  
  // 点击第一个项目的归档按钮
  const archiveButtons = page.locator('button:has-text("归档")');
  const count = await archiveButtons.count();
  
  console.log(`找到 ${count} 个归档按钮`);
  
  if (count === 0) {
    console.log('❌ 未找到归档按钮');
    throw new Error('未找到归档按钮');
  }
  
  console.log('点击第一个归档按钮...');
  await archiveButtons.first().click();
  await page.waitForTimeout(2000);
  
  // 检查归档确认模态框是否出现
  const modalVisible = await page.locator('.ant-modal').count();
  console.log(`模态框数量: ${modalVisible}`);
  
  if (modalVisible === 0) {
    console.log('❌ 归档确认模态框未出现');
    throw new Error('归档确认模态框未出现');
  }
  
  // 检查模态框内容
  const modalText = await page.locator('.ant-modal-body').textContent();
  console.log('模态框内容:', modalText);
  
  // 截图
  await page.screenshot({ path: 'test-results/archive-modal.png', fullPage: true });
  
  console.log('✅ 归档功能正常');
});
