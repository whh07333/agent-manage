import { test, expect } from '@playwright/test';

test('捕获所有控制台输出', async ({ page }) => {
  // 捕获所有控制台消息
  const logs: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    logs.push(`[${msg.type().toUpperCase()}] ${text}`);
    
    if (msg.type() === 'error') {
      errors.push(text);
    } else if (msg.type() === 'warning') {
      warnings.push(text);
    }
  });
  
  // 捕获页面错误
  page.on('pageerror', error => {
    const errorMsg = error.toString();
    errors.push(`[PAGE ERROR] ${errorMsg}`);
  });
  
  await page.goto('http://localhost:5173/projects');
  await page.waitForTimeout(5000);
  
  // 输出所有日志
  console.log('=== 所有控制台消息 ===');
  logs.forEach((log, i) => {
    if (i < 20) {
      console.log(`${i + 1}. ${log}`);
    }
  });
  
  console.log('');
  console.log('=== 错误统计 ===');
  console.log(`错误数量: ${errors.length}`);
  console.log(`警告数量: ${warnings.length}`);
  
  if (errors.length > 0) {
    console.log('');
    console.log('=== 所有错误 ===');
    errors.forEach((err, i) => console.log(`${i + 1}. ${err}`));
  }
  
  // 截图
  await page.screenshot({ path: 'console-capture.png', fullPage: true });
});
