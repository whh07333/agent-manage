import { test, expect } from '@playwright/test';

test('联调：项目详情页跳转', async ({ page }) => {
  console.log('=== 项目详情页跳转验证 ===');
  
  // 1. 访问项目列表
  console.log('1️⃣ 访问项目列表...');
  await page.goto('http://localhost:5173/projects');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // 2. 点击第一个项目卡片
  console.log('2️⃣ 点击第一个项目...');
  const firstCard = page.locator('.ant-list-item').first();
  await expect(firstCard).toBeVisible({ timeout: 5000 });
  
  // 获取项目名称
  const projectName = await firstCard.locator('span').first().textContent();
  console.log(`✓ 项目名称: ${projectName}`);
  
  // 点击项目卡片
  await firstCard.click();
  
  // 3. 等待URL变化
  console.log('3️⃣ 等待页面跳转...');
  await page.waitForURL(/\/projects\/[a-f0-9-]+/, { timeout: 10000 });
  
  const currentUrl = page.url();
  console.log(`✓ 当前URL: ${currentUrl}`);
  
  // 4. 验证URL格式
  expect(currentUrl).toMatch(/\/projects\/[a-f0-9-]+/);
  
  // 5. 等待页面加载
  console.log('4️⃣ 等待页面加载...');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // 6. 验证页面标题
  const pageTitle = page.locator('h2, h1, h3').first();
  await expect(pageTitle).toBeVisible();
  const titleText = await pageTitle.textContent();
  console.log(`✓ 页面标题: ${titleText}`);
  
  // 7. 截图
  console.log('5️⃣ 截图保存...');
  await page.screenshot({ path: 'test-results/integration-project-detail.png', fullPage: true });
  console.log('✓ 截图已保存');
  
  console.log('\n=== 验证完成 ===');
  console.log('✅ 项目详情页跳转验证通过');
});
