const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/projects');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  console.log('=== 页面加载完成 ===');
  
  const buttons = await page.$$('button');
  console.log(`找到 ${buttons.length} 个按钮`);
  
  for (let i = 0; i < Math.min(buttons.length, 10); i++) {
    const text = await buttons[i].textContent();
    console.log(`按钮 ${i + 1}: "${text}"`);
  }
  
  const inputs = await page.$$('input');
  console.log(`找到 ${inputs.length} 个输入框`);
  
  const textareas = await page.$$('textarea');
  console.log(`找到 ${textareas.length} 个文本域`);
  
  await page.screenshot({ path: '/tmp/projects-page-structure.png' });
  console.log('=== 截图已保存到 /tmp/projects-page-structure.png ===');
  
  // 点击创建按钮
  for (let i = 0; i < buttons.length; i++) {
    const text = await buttons[i].textContent();
    if (text && (text.includes('创建项目') || text.includes('新建'))) {
      console.log(`找到创建按钮: "${text.trim()}"`);
      await buttons[i].click();
      await page.waitForTimeout(5000);
      break;
    }
  }
  
  await page.screenshot({ path: '/tmp/create-modal-opened.png' });
  console.log('=== Modal打开截图已保存到 /tmp/create-modal-opened.png ===');
  
  const modal = await page.$('.ant-modal, .modal, .dialog, [role="dialog"]');
  if (modal) {
    const modalText = await modal.textContent();
    console.log(`Modal内容长度: ${modalText?.length || 0}`);
  }
  
  await browser.close();
})();
