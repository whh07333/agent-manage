const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    storageState: {
      origins: [
        {
          origin: 'http://localhost:5173',
          localStorage: [
            {
              name: 'token',
              value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlhdCI6MTc3NDgyMTg0MiwiZXhwIjoxNzc0ODY2NjgyfQ.PtCq0uk4GWu0W_0dzocyg-DIvxFHAp55qC7lax3tpfw',
            },
          ],
        },
      ],
    },
  });
  const page = await context.newPage();

  try {
    await page.goto('http://localhost:5173/projects', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('✓ Page loaded');
    
    // 监听浏览器控制台日志
    page.on('console', msg => {
      console.log('Browser console:', msg.type(), msg.text());
    });
    
    // 点击创建项目按钮
    await page.click('button:has-text("创建项目")', { timeout: 10000 });
    console.log('✓ Clicked create button');
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/01-modal-opened.png' });
    
    // 填写表单
    await page.fill('input[placeholder="请输入项目名称"]', 'Debug Test Project');
    await page.fill('textarea[placeholder="请输入项目描述"]', 'Debug test via Playwright');
    await page.fill('input[placeholder="请输入项目负责人"]', 'Debug Agent');
    
    // 选择优先级P1
    await page.click('button:has-text("P1 - 高")');
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'test-results/02-form-filled.png' });
    
    // 点击创建项目按钮
    const submitButton = page.locator('.ant-modal').getByText('创建项目');
    await submitButton.click({ timeout: 10000 });
    console.log('✓ Clicked submit button');
    
    // 等待更长时间，让API调用完成
    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'test-results/03-after-submit.png' });
    
  } catch (error) {
    console.error('Error:', error);
    await page.screenshot({ path: 'test-results/09-error.png' });
  } finally {
    await context.close();
    await browser.close();
  }
})();
