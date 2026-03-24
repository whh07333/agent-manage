import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 设置token后访问
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
  console.log(`\n❓ 包含"创建项目"? ${hasCreateProject}`);
  
  // 查找是否包含部分文本
  const hasCreate = allText.includes('创建');
  const hasProject = allText.includes('项目');
  console.log(`❓ 包含"创建"? ${hasCreate}, 包含"项目"? ${hasProject}`);
  
  // 列出所有按钮文本
  const buttonTexts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim());
  });
  console.log('\n🖱️ 所有按钮文本:');
  buttonTexts.forEach((t, i) => console.log(`  [${i}] ${JSON.stringify(t)}`));
  
  // 定位按钮
  const createButtons = await page.getByText('创建项目').all();
  console.log(`\n🔍 getByText('创建项目') 匹配到 ${createButtons.length} 个元素`);
  
  for (const btn of createButtons) {
    const isVisible = await btn.isVisible();
    console.log(`   - 可见? ${isVisible}`);
  }
  
  await browser.close();
})();
