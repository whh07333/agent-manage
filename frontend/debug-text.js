const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 设置token
  await page.goto('http://localhost:8080/projects', { waitUntil: 'networkidle', timeout: 15000 });
  await page.evaluate(() => {
    localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlhdCI6MTc3NDE5MzgxOCwiZXhwIjoxODA1NzUxNDg4fQ.U8O9DYSacgW2INc8bbn6eDLpnbDcg');
  });
  await page.reload({ waitUntil: 'networkidle', timeout: 15000 });
  
  // 获取所有可见文本
  const allText = await page.evaluate(() => document.body.textContent);
  console.log('=== PAGE TEXT BEGIN ===');
  console.log(allText);
  console.log('=== PAGE TEXT END ===');
  
  // 查找"创建项目"
  const hasCreateProject = allText.includes('创建项目');
  console.log(`\n包含"创建项目"? ${hasCreateProject}`);
  
  // 列出所有按钮文本
  const buttonTexts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim());
  });
  console.log('\n所有按钮文本:');
  buttonTexts.forEach((t, i) => console.log(`  [${i}] ${JSON.stringify(t)}`));
  
  await browser.close();
})();
