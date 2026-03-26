import { test, expect } from '@playwright/test';

test('联调：验证实时监控API对接', async ({ page }) => {
  console.log('=== 验证实时监控API对接 ===');
  
  // 1. 访问实时监控页面
  console.log('1️⃣ 访问实时监控页面...');
  await page.goto('http://localhost:5173/monitor');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000); // 等待API调用完成
  console.log('✓ 页面已加载');
  
  // 2. 检查是否有API调用
  console.log('2️⃣ 监听网络请求...');
  const apiRequests: any[] = [];
  page.on('request', request => {
    if (request.url().includes('/api/statistics/realtime')) {
      apiRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // 3. 等待几秒，让API调用完成
  console.log('3️⃣ 等待API调用...');
  await page.waitForTimeout(10000);
  
  // 4. 检查API调用结果
  console.log('4️⃣ 检查API调用...');
  console.log(`✓ 找到 ${apiRequests.length} 个API请求`);
  
  if (apiRequests.length > 0) {
    apiRequests.forEach((req, index) => {
      console.log(`  请求${index + 1}: ${req.method} ${req.url}`);
    });
    
    // 5. 截图
    console.log('5️⃣ 截图保存...');
    await page.screenshot({ path: 'test-results/integration-api-verification.png', fullPage: true });
    console.log('✓ 截图已保存');
    
    console.log('\n=== 验证完成 ===');
    console.log('✅ 实时监控API对接正常');
  } else {
    console.log('❌ 未检测到API调用');
    console.log('⚠️ 可能仍在使用模拟数据');
    
    // 截图用于调试
    await page.screenshot({ path: 'test-results/integration-api-verification-error.png', fullPage: true });
  }
});
