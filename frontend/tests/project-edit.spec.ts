import { test, expect } from '@playwright/test';

test('项目编辑：验证编辑按钮点击和表单填写', async ({ page, context }) => {
  // 设置Token
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQzNjU1ODIsImV4cCI6MTc3NDk3MzI3OX0.csZTqW8J3EIAuIRLXRAC_XUU1t8d-zuo8YO7HApJP3g';
  await context.addInitScript((t) => localStorage.setItem('token', t), token);
  
  console.log('=== 开始测试项目编辑 ===');
  
  // 访问项目列表页
  await page.goto('http://localhost:5173/projects');
  await page.waitForTimeout(3000);
  
  // 点击第一个项目的编辑按钮
  const editButtons = page.locator('button:has-text("编辑")');
  const count = await editButtons.count();
  
  console.log(`找到 ${count} 个编辑按钮`);
  
  if (count === 0) {
    console.log('❌ 未找到编辑按钮');
    await page.screenshot({ path: 'test-results/no-edit-buttons.png', fullPage: true });
    throw new Error('未找到编辑按钮');
  }
  
  console.log('点击第一个编辑按钮...');
  await editButtons.first().click();
  await page.waitForTimeout(2000);
  
  // 检查编辑模态框是否出现
  const modalVisible = await page.locator('.ant-modal').count();
  console.log(`模态框数量: ${modalVisible}`);
  
  if (modalVisible === 0) {
    console.log('❌ 编辑模态框未出现');
    await page.screenshot({ path: 'test-results/no-edit-modal.png', fullPage: true });
    throw new Error('编辑模态框未出现');
  }
  
  // 检查模态框标题
  const modalTitle = await page.locator('.ant-modal-title').textContent();
  console.log('模态框标题:', modalTitle);
  
  if (modalTitle !== '编辑项目') {
    console.log('❌ 模态框标题不正确');
    await page.screenshot({ path: 'test-results/wrong-modal-title.png', fullPage: true });
    throw new Error(`模态框标题不正确: ${modalTitle}`);
  }
  
  // 检查表单是否预填充了数据
  const nameInput = page.locator('input[placeholder*="项目名称"]');
  const nameValue = await nameInput.inputValue();
  console.log('项目名称:', nameValue);
  
  if (!nameValue) {
    console.log('❌ 表单未预填充数据');
    await page.screenshot({ path: 'test-results/no-form-data.png', fullPage: true });
    throw new Error('表单未预填充数据');
  }
  
  // 截图
  await page.screenshot({ path: 'test-results/edit-modal-opened.png', fullPage: true });
  
  console.log('✅ 编辑功能正常');
});
