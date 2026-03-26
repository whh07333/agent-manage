import { test, expect, Page } from '@playwright/test';

/**
 * 调试测试: 检查页面结构
 */

test('检查项目列表页面的所有按钮和元素', async ({ page }) => {
  await page.goto('http://localhost:5173/projects');
  await page.waitForLoadState('networkidle');
  
  // 截图保存
  await page.screenshot({ path: 'test-results/page-structure.png' });
  
  // 获取页面上所有的按钮
  const buttons = await page.$$eval('button', buttons => 
    buttons.map(btn => ({
      text: btn.textContent?.trim(),
      className: btn.className,
      ariaLabel: btn.getAttribute('aria-label'),
      type: btn.getAttribute('type'),
      id: btn.getAttribute('id')
    }))
  );
  
  console.log('=== 页面上的所有按钮 ===');
  buttons.forEach((btn, index) => {
    console.log(`按钮 ${index}:`, btn);
  });
  
  // 获取页面上所有的链接
  const links = await page.$$eval('a', links =>
    links.map(link => ({
      text: link.textContent?.trim(),
      href: link.getAttribute('href'),
      className: link.className
    }))
  );
  
  console.log('\n=== 页面上的所有链接 ===');
  links.forEach((link, index) => {
    if (link.text && link.text.length < 50) {
      console.log(`链接 ${index}:`, link);
    }
  });
  
  // 获取页面上所有的输入框
  const inputs = await page.$$eval('input, textarea', inputs =>
    inputs.map(input => ({
      type: input.getAttribute('type'),
      name: input.getAttribute('name'),
      placeholder: input.getAttribute('placeholder'),
      id: input.getAttribute('id'),
      className: input.className
    }))
  );
  
  console.log('\n=== 页面上的所有输入框 ===');
  inputs.forEach((input, index) => {
    console.log(`输入框 ${index}:`, input);
  });
});
