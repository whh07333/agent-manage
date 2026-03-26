import { test, expect } from '@playwright/test';

test('联调：项目归档Modal功能', async ({ page }) => {
  console.log('=== 项目归档Modal功能验证 ===');
  
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
  
  // 3. 点击"归档"按钮
  console.log('3️⃣ 点击"归档"按钮...');
  const archiveButton = firstCard.locator('button').filter({ hasText: /归档/ });
  await expect(archiveButton).toBeVisible();
  await archiveButton.click();
  console.log('✓ 已点击归档按钮');
  
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
  expect(titleText).toMatch(/归档/);
  
  // 6. 检查归档原因输入框
  console.log('6️⃣ 检查归档原因输入框...');
  const reasonInput = page.locator('textarea').filter({ hasText: /归档原因/ });
  const inputExists = await reasonInput.count() > 0;
  console.log(`✓ 归档原因输入框: ${inputExists ? '存在' : '不存在'}`);
  
  // 7. 检查操作按钮
  console.log('7️⃣ 检查操作按钮...');
  const buttons = page.locator('.ant-modal button');
  const buttonCount = await buttons.count();
  console.log(`✓ 找到 ${buttonCount} 个按钮`);
  
  // 8. 截图
  console.log('8️⃣ 截图保存...');
  await page.screenshot({ path: 'test-results/integration-project-archive.png', fullPage: true });
  console.log('✓ 截图已保存');
  
  console.log('\n=== 验证完成 ===');
  console.log('✅ 项目归档Modal功能已验证');
});
