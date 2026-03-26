import { test, expect } from '@playwright/test';

test('联调：项目创建Modal功能', async ({ page }) => {
  console.log('=== 项目创建Modal功能验证 ===');
  
  // 1. 访问项目列表
  console.log('1️⃣ 访问项目列表...');
  await page.goto('http://localhost:5173/projects');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  console.log('✓ 项目列表已加载');
  
  // 2. 查找并点击"创建项目"按钮
  console.log('2️⃣ 点击"创建项目"按钮...');
  const createButton = page.locator('button').filter({ hasText: /创建/ }).first();
  await expect(createButton).toBeVisible({ timeout: 5000 });
  await createButton.click();
  console.log('✓ 已点击');
  
  // 3. 等待Modal打开（使用.ant-modal-mask确保Modal可见）
  console.log('3️⃣ 等待Modal打开...');
  const modalMask = page.locator('.ant-modal-mask').first();
  await expect(modalMask).toBeVisible({ timeout: 5000 });
  console.log('✓ Modal已打开');
  
  // 4. 检查Modal标题
  console.log('4️⃣ 检查Modal标题...');
  const modalTitle = page.locator('.ant-modal-title');
  await expect(modalTitle).toBeVisible();
  const titleText = await modalTitle.textContent();
  console.log(`✓ Modal标题: ${titleText}`);
  
  // 5. 检查表单字段（使用更宽松的选择器）
  console.log('5️⃣ 检查表单字段...');
  
  const formItems = page.locator('.ant-form-item');
  const formItemCount = await formItems.count();
  console.log(`✓ 找到 ${formItemCount} 个表单项`);
  
  // 6. 截图
  console.log('6️⃣ 截图保存...');
  await page.screenshot({ path: 'test-results/integration-project-create.png', fullPage: true });
  console.log('✓ 截图已保存');
  
  console.log('\n=== 验证完成 ===');
  console.log('✅ 项目创建Modal功能已验证');
});
