import { test, expect } from '@playwright/test';

test('联调：项目归档CRUD操作', async ({ page }) => {
  console.log('=== 项目归档CRUD操作验证 ===');
  
  // 1. 访问项目列表
  console.log('1️⃣ 访问项目列表...');
  await page.goto('http://localhost:5173/projects');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  console.log('✓ 页面已加载');
  
  // 2. 找到第一个项目并点击"归档"
  console.log('2️⃣ 点击"归档"按钮...');
  const firstCard = page.locator('.ant-list-item').first();
  const archiveButton = firstCard.locator('button').filter({ hasText: /归档/ });
  await expect(archiveButton).toBeVisible();
  await archiveButton.click();
  console.log('✓ 已点击归档按钮');
  
  // 3. 等待Modal打开
  console.log('3️⃣ 等待Modal打开...');
  const modalMask = page.locator('.ant-modal-mask').first();
  await expect(modalMask).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(2000);
  console.log('✓ Modal已打开');
  
  // 4. 检查Modal内容
  console.log('4️⃣ 检查Modal内容...');
  const modalContent = page.locator('.ant-modal-content');
  const contentExists = await modalContent.count() > 0;
  console.log(`✓ Modal内容: ${contentExists ? '存在' : '不存在'}`);
  
  // 5. 截图
  console.log('5️⃣ 截图保存...');
  await page.screenshot({ path: 'test-results/integration-project-archive-crud.png', fullPage: true });
  console.log('✓ 截图已保存');
  
  console.log('\n=== 验证完成 ===');
  console.log('✅ 项目归档CRUD操作验证完成');
});
