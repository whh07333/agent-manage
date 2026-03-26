import { test, expect } from '@playwright/test';

test('联调：项目编辑Modal功能', async ({ page }) => {
  console.log('=== 项目编辑Modal功能验证 ===');
  
  // 1. 访问项目列表
  console.log('1️⃣ 访问项目列表...');
  await page.goto('http://localhost:5173/projects');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  console.log('✓ 项目列表已加载');
  
  // 2. 找到第一个项目
  console.log('2️⃣ 查找第一个项目...');
  const firstCard = page.locator('.ant-list-item').first();
  await expect(firstCard).toBeVisible({ timeout: 5000 });
  console.log('✓ 找到第一个项目');
  
  // 3. 点击"编辑"按钮
  console.log('3️⃣ 点击"编辑"按钮...');
  const editButton = firstCard.locator('button').filter({ hasText: /编辑/ });
  await expect(editButton).toBeVisible();
  await editButton.click();
  console.log('✓ 已点击编辑按钮');
  
  // 4. 等待Modal打开
  console.log('4️⃣ 等待Modal打开...');
  const modalMask = page.locator('.ant-modal-mask').first();
  await expect(modalMask).toBeVisible({ timeout: 5000 });
  console.log('✓ Modal已打开');
  
  // 5. 检查Modal标题
  console.log('5️⃣ 检查Modal标题...');
  const modalTitle = page.locator('.ant-modal-title');
  await expect(modalTitle).toBeVisible();
  const titleText = await modalTitle.textContent();
  console.log(`✓ Modal标题: ${titleText}`);
  expect(titleText).toMatch(/编辑/);
  
  // 6. 检查表单字段
  console.log('6️⃣ 检查表单字段...');
  const formItems = page.locator('.ant-form-item');
  const formItemCount = await formItems.count();
  console.log(`✓ 找到 ${formItemCount} 个表单项`);
  
  // 7. 截图
  console.log('7️⃣ 截图保存...');
  await page.screenshot({ path: 'test-results/integration-project-edit.png', fullPage: true });
  console.log('✓ 截图已保存');
  
  console.log('\n=== 验证完成 ===');
  console.log('✅ 项目编辑Modal功能已验证');
});
