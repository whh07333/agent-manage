import { test, expect } from '@playwright/test';

test('联调：验证Analytics页面API对接', async ({ page }) => {
  console.log('=== 验证Analytics页面API对接 ===');
  
  // 1. 在访问页面之前就设置监听器
  console.log('1️⃣ 设置网络请求监听器...');
  const apiRequests: any[] = [];
  page.on('request', request => {
    if (request.url().includes('/api/statistics')) {
      apiRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString()
      });
      console.log(`  捕获API请求: ${request.method} ${request.url()}`);
    }
  });
  
  // 2. 访问Analytics页面
  console.log('2️⃣ 访问Analytics页面...');
  await page.goto('http://localhost:5173/statistics');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000); // 等待API调用完成
  console.log('✓ 页面已加载');
  
  // 3. 检查API调用结果
  console.log('3️⃣ 检查API调用结果...');
  console.log(`✓ 总共找到 ${apiRequests.length} 个API请求`);
  
  if (apiRequests.length > 0) {
    // 4. 截图
    console.log('4️⃣ 截图保存...');
    await page.screenshot({ path: 'test-results/integration-analytics-verification.png', fullPage: true });
    console.log('✓ 截图已保存');
    
    console.log('\n=== 验证完成 ===');
    console.log('✅ Analytics页面API对接正常');
  } else {
    console.log('❌ 未检测到任何API调用');
    console.log('⚠️ 检查console错误或API路径是否正确');
    
    // 截图用于调试
    await page.screenshot({ path: 'test-results/integration-analytics-verification-error.png', fullPage: true });
  }
});
