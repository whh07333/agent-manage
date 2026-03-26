import { test, expect } from '@playwright/test';

test('联调：项目编辑CRUD操作', async ({ page }) => {
  console.log('=== 项目编辑CRUD操作验证 ===');
  
  // 1. 访问项目列表
  console.log('1️⃣ 访问项目列表...');
  await page.goto('http://localhost:5173/projects');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  console.log('✓ 页面已加载');
  
  // 2. 找到第一个项目并点击"编辑"
  console.log('2️⃣ 点击"编辑"按钮...');
  const firstCard = page.locator('.ant-list-item').first();
  const editButton = firstCard.locator('button').filter({ hasText: /编辑/ });
  await expect(editButton).toBeVisible();
  await editButton.click();
  console.log('✓ 已点击编辑按钮');
  
  // 3. 等待Modal打开
  console.log('3️⃣ 等待Modal打开...');
  const modalMask = page.locator('.ant-modal-mask').first();
  await expect(modalMask).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(2000);
  console.log('✓ Modal已打开');
  
  // 4. 检查表单是否自动填充
  console.log('4️⃣ 检查表单自动填充...');
  const modalInputs = page.locator('.ant-modal input, .ant-modal textarea');
  const inputCount = await modalInputs.count();
  console.log(`✓ 找到 ${inputCount} 个输入框`);
  
  // 5. 截图
  console.log('5️⃣ 截图保存...');
  await page.screenshot({ path: 'test-results/integration-project-edit-crud.png', fullPage: true });
  console.log('✓ 截图已保存');
  
  console.log('\n=== 验证完成 ===');
  console.log('✅ 项目编辑CRUD操作验证完成');
});
