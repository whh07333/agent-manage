import { test, expect } from '@playwright/test';

test('联调：项目管理模块基础验证', async ({ page }) => {
  console.log('=== 项目管理模块联调验证 ===\n');
  
  // 1. 访问项目列表
  console.log('1️⃣ 访问项目列表...');
  await page.goto('http://localhost:5173/projects');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  const pageTitle = page.locator('h2, h1, h3').filter({ hasText: /项目/ });
  await expect(pageTitle).toBeVisible();
  console.log('✓ 项目列表页面标题已显示');
  
  const listItems = page.locator('.ant-list-item');
  const projectCount = await listItems.count();
  console.log(`✓ 找到 ${projectCount} 个项目`);
  expect(projectCount).toBeGreaterThan(0);
  
  // 2. 验证项目卡片显示
  console.log('\n2️⃣ 验证项目卡片显示...');
  const firstCard = listItems.first();
  await expect(firstCard).toBeVisible();
  console.log('✓ 第一个项目卡片已显示');
  
  const projectName = await firstCard.locator('span').filter({ hasText: /[a-zA-Z0-9]/ }).first().textContent();
  console.log(`✓ 项目名称: ${projectName}`);
  
  // 3. 验证操作按钮
  console.log('\n3️⃣ 验证操作按钮...');
  const buttons = await firstCard.locator('button').all();
  const buttonCount = buttons.length;
  console.log(`✓ 找到 ${buttonCount} 个操作按钮`);
  expect(buttonCount).toBeGreaterThan(0);
  
  const buttonTexts = await Promise.all(buttons.map(btn => btn.textContent()));
  console.log('✓ 按钮文本:', buttonTexts);
  
  // 4. 验证创建按钮
  console.log('\n4️⃣ 验证创建按钮...');
  const createButton = page.locator('button').filter({ hasText: /创建/ }).first();
  await expect(createButton).toBeVisible();
  console.log('✓ 创建项目按钮已显示');
  
  // 5. 截图
  console.log('\n5️⃣ 截图保存...');
  await page.screenshot({ path: 'test-results/integration-project-list.png', fullPage: true });
  console.log('✓ 截图已保存: test-results/integration-project-list.png');
  
  console.log('\n=== 验证完成 ===');
  console.log('✅ 项目管理模块基础验证通过');
});
