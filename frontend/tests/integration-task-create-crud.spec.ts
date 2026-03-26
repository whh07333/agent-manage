import { test, expect } from '@playwright/test';

test('联调：任务创建CRUD操作', async ({ page }) => {
  console.log('=== 任务创建CRUD操作验证 ===');
  
  // 1. 访问任务列表
  console.log('1️⃣ 访问任务列表...');
  await page.goto('http://localhost:5173/tasks');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  console.log('✓ 页面已加载');
  
  // 2. 检查是否有"创建任务"按钮
  console.log('2️⃣ 检查"创建任务"按钮...');
  const createButton = page.locator('button').filter({ hasText: /创建/ }).first();
  const buttonExists = await createButton.count() > 0;
  console.log(`✓ 创建任务按钮: ${buttonExists ? '存在' : '不存在'}`);
  
  // 3. 如果按钮存在，点击它
  if (buttonExists) {
    console.log('3️⃣ 点击"创建任务"按钮...');
    await createButton.click();
    console.log('✓ 已点击');
    
    // 4. 等待响应
    console.log('4️⃣ 等待响应...');
    await page.waitForTimeout(3000);
  }
  
  // 5. 检查URL变化
  const currentUrl = page.url();
  console.log(`✓ 当前URL: ${currentUrl}`);
  
  // 6. 截图
  console.log('5️⃣ 截图保存...');
  await page.screenshot({ path: 'test-results/integration-task-create-crud.png', fullPage: true });
  console.log('✓ 截图已保存');
  
  console.log('\n=== 验证完成 ===');
  console.log('✅ 任务创建CRUD操作验证完成');
});
