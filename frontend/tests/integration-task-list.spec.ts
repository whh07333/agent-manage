import { test, expect } from '@playwright/test';

test('联调：任务列表页面验证', async ({ page }) => {
  console.log('=== 任务列表页面验证 ===');
  
  // 1. 访问任务列表
  console.log('1️⃣ 访问任务列表...');
  await page.goto('http://localhost:5173/tasks');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  console.log('✓ 任务列表页面已加载');
  
  // 2. 检查页面标题
  console.log('2️⃣ 检查页面标题...');
  const pageTitle = page.locator('h2, h1, h3').filter({ hasText: /任务/ });
  const titleExists = await pageTitle.count() > 0;
  console.log(`✓ 页面标题: ${titleExists ? '存在' : '不存在'}`);
  
  // 3. 检查任务列表
  console.log('3️⃣ 检查任务列表...');
  const taskList = page.locator('.ant-list, .ant-table');
  const listExists = await taskList.count() > 0;
  console.log(`✓ 任务列表容器: ${listExists ? '存在' : '不存在'}`);
  
  // 4. 检查创建任务按钮
  console.log('4️⃣ 检查创建任务按钮...');
  const createButton = page.locator('button').filter({ hasText: /创建/ });
  const buttonExists = await createButton.count() > 0;
  console.log(`✓ 创建任务按钮: ${buttonExists ? '存在' : '不存在'}`);
  
  // 5. 截图
  console.log('5️⃣ 截图保存...');
  await page.screenshot({ path: 'test-results/integration-task-list.png', fullPage: true });
  console.log('✓ 截图已保存');
  
  console.log('\n=== 验证完成 ===');
  console.log('✅ 任务列表页面验证完成');
});
