import { test, expect } from '@playwright/test';

test('浏览器完整调试：检查所有状态', async ({ page }) => {
  // 监听所有错误
  const errors: any[] = [];
  const warnings: string[] = [];
  
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[${type.toUpperCase()}] ${text}`);
    
    if (type === 'error') {
      errors.push(text);
    } else if (type === 'warning') {
      warnings.push(text);
    }
  });
  
  page.on('pageerror', error => {
    const errorMsg = error.toString();
    console.log(`[PAGE ERROR] ${errorMsg}`);
    errors.push(errorMsg);
  });
  
  // 导航到页面
  await page.goto('http://localhost:5173/projects');
  await page.waitForTimeout(5000);
  
  // 检查页面状态
  console.log('=== 页面状态检查 ===');
  
  const title = await page.title();
  console.log('页面标题:', title);
  
  const url = page.url();
  console.log('当前URL:', url);
  
  // 检查关键元素
  const loading = await page.locator('.ant-spin').count();
  const empty = await page.locator('.ant-empty').count();
  const listItems = await page.locator('.ant-list-item').count();
  const createButton = await page.locator('button:has-text("创建项目")').count();
  const modal = await page.locator('.ant-modal').count();
  
  console.log(`Loading元素: ${loading}`);
  console.log(`Empty元素: ${empty}`);
  console.log(`List Item元素: ${listItems}`);
  console.log(`创建项目按钮: ${createButton}`);
  console.log(`Modal元素: ${modal}`);
  
  // 截图
  await page.screenshot({ path: 'browser-full-debug.png', fullPage: true });
  
  // 总结
  console.log('=== 总结 ===');
  console.log(`错误数量: ${errors.length}`);
  console.log(`警告数量: ${warnings.length}`);
  console.log(`页面是否加载: ${listItems > 0}`);
  
  if (errors.length > 0) {
    console.log('');
    console.log('=== 所有错误 ===');
    errors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
  }
  
  if (warnings.length > 0) {
    console.log('');
    console.log('=== 所有警告 ===');
    warnings.forEach((warn, i) => console.log(`${i + 1}. ${warn}`));
  }
  
  // 验证
  expect(listItems).toBeGreaterThan(0);
});
