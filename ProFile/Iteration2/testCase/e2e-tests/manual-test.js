const { chromium } = require('playwright');

(async () => {
  console.log('=== 开始手动创建项目测试 ===');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000  // 慢速模式，方便观察
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('http://localhost:5173/projects');
  await page.waitForLoadState('networkidle');
  console.log('✓ 页面已加载');
  
  // 等待用户手动测试
  console.log('✓ 浏览器已打开');
  console.log('✓ 请手动创建一个项目');
  console.log('✓ 创建完成后，按Ctrl+C结束');
  console.log('✓ 等待60秒后自动关闭...');
  
  // 等待60秒
  await page.waitForTimeout(60000);
  
  await browser.close();
  console.log('=== 测试完成 ===');
})();
