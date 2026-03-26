const { chromium } = require('@playwright/test');

(async () => {
  console.log('=== Playwright手动测试 ===');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });
  
  const page = await browser.newPage();
  
  // 监听所有网络请求
  page.on('request', request => {
    const url = request.url();
    const method = request.method();
    console.log(`[请求] ${method} ${url}`);
    
    // 监听响应
    request.resourceType() === 'xhr' || request.resourceType() === 'fetch' ? request.on('response', response => {
      console.log(`[响应] ${response.status()} ${url}`);
      if (url.includes('projects') && method === 'POST') {
        response.body().then(body => {
          console.log(`[项目创建响应] ${body.substring(0, 200)}...`);
        });
      }
    }) : null;
  });
  
  await page.goto('http://localhost:5173/projects');
  await page.waitForLoadState('networkidle');
  console.log('✓ 页面已加载');
  
  // 截图
  await page.screenshot({ path: '/tmp/projects-page-before.png' });
  console.log('✓ 截图已保存');
  
  // 点击创建按钮
  const buttons = await page.$$('button');
  console.log(`✓ 找到 ${buttons.length} 个按钮`);
  
  let createButton = null;
  for (let i = 0; i < buttons.length; i++) {
    const text = await buttons[i].textContent();
    if (text && (text.includes('创建项目') || text.includes('新建'))) {
      createButton = buttons[i];
      console.log(`✓ 找到创建按钮: "${text.trim()}"`);
      break;
    }
  }
  
  expect(createButton, '应该找到创建项目按钮').not.toBeNull();
  await createButton.click();
  console.log('✓ 点击了创建按钮');
  
  // 等待Modal框打开
  await page.waitForTimeout(2000);
  console.log('✓ 等待Modal框打开');
  
  // 填写项目信息
  const timestamp = Date.now();
  const projectName = `Playwright手动测试-${timestamp}`;
  
  const inputs = await page.$$('input');
  console.log(`✓ 找到 ${inputs.length} 个输入框`);
  
  const nameInput = inputs[0];
  await nameInput.fill(projectName);
  console.log(`✓ 填写项目名称: ${projectName}`);
  
  const textareas = await page.$$('textarea');
  if (textareas.length > 0) {
    await textareas[0].fill('这是Playwright手动测试项目');
    console.log('✓ 填写项目描述');
  }
  
  await page.screenshot({ path: '/tmp/form-filled.png' });
  console.log('✓ 截图已保存');
  
  // 点击保存按钮
  const allButtons = await page.$$('button');
  let saveButton = null;
  for (let i = 0; i < allButtons.length; i++) {
    const text = await allButtons[i].textContent();
    if (text && (text.includes('保存') || text.includes('创建'))) {
      saveButton = allButtons[i];
      console.log(`✓ 找到保存按钮: "${text.trim()}"`);
      break;
    }
  }
  
  expect(saveButton, '应该找到保存按钮').not.toBeNull();
  await saveButton.click();
  console.log('✓ 点击了保存按钮');
  
  // 等待项目创建完成
  console.log('✓ 等待项目创建完成（最长30秒）');
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(1000);
    const pageContent = await page.content();
    if (pageContent.includes(projectName)) {
      console.log(`✓ 项目 "${projectName}" 已出现在页面中 (第${i+1}秒)`);
      break;
    }
  }
  
  const finalProjectExists = await page.content().then(content => content.includes(projectName));
  console.log(`✓ 项目 "${projectName}" 是否在页面中: ${finalProjectExists}`);
  
  await browser.close();
  console.log('=== 手动测试完成 ===');
})();
