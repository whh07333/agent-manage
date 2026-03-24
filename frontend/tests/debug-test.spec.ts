import { test, expect } from '@playwright/test';

const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQzMTUzODYsImV4cCI6MTc3NDkyMDE4Nn0.QXecZmpDGTeQ6sCkVt7t6XdMZsSw75ENgpaa7kL9D1U';

test.use({
  storageState: {
    origins: [
      {
        origin: 'http://localhost:5173',
        localStorage: [
          {
            name: 'token',
            value: validToken,
          },
        ],
      },
    ],
  },
});

test('Debug test', async ({ page }) => {
  console.log('=== 开始调试测试 ===');
  
  // 监听网络请求
  const apiRequests: string[] = [];
  page.on('request', request => {
    if (request.url().includes('api')) {
      apiRequests.push(`${request.method()} ${request.url()}`);
      console.log('📤 请求:', request.method(), request.url());
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('api')) {
      console.log('📥 响应:', response.status(), response.url());
    }
  });
  
  // 设置token
  await page.goto('http://localhost:5173');
  await page.evaluate((token) => {
    localStorage.setItem('token', token);
  }, validToken);
  
  console.log('Token已设置');
  
  // 跳转到项目页面
  console.log('正在跳转到项目页面...');
  await page.goto('http://localhost:5173/projects', { waitUntil: 'networkidle' });
  console.log('页面URL:', page.url());
  
  // 等待一段时间
  await page.waitForTimeout(3000);
  
  // 检查页面内容
  const bodyText = await page.locator('body').textContent();
  console.log('页面内容长度:', bodyText?.length);
  
  // 检查是否有错误
  const hasError = await page.locator('Unexpected Application Error').count();
  if (hasError > 0) {
    console.log('❌ 页面有错误');
    const errorText = await page.locator('body').textContent();
    console.log('错误信息:', errorText?.substring(0, 500));
  } else {
    console.log('✅ 页面无错误');
  }
  
  // 查找按钮
  const buttonCount = await page.locator('button').count();
  console.log('按钮总数:', buttonCount);
  
  const createButton = await page.locator('button').filter({ hasText: '创建项目' }).count();
  console.log('创建项目按钮数量:', createButton);
  
  if (createButton === 0) {
    console.log('❌ 未找到创建项目按钮');
    const allButtons = await page.locator('button').allTextContents();
    console.log('所有按钮文本:', allButtons);
    
    // 截图
    await page.screenshot({ path: '/tmp/debug-screenshot.png' });
    console.log('已保存截图到 /tmp/debug-screenshot.png');
  } else {
    console.log('✅ 找到创建项目按钮');
  }
  
  console.log('API请求数量:', apiRequests.length);
});
