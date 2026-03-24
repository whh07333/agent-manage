import { test } from '@playwright/test';

// 新生成的有效token
const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlhdCI6MTc3NDIzMjMzNSwiZXhwIjoxNzc0ODM3MTM1fQ.cyrkH4oRP5uMLpFzasFhai64rqfam4BLjTWdX0FDQ-I';

test.describe('Diagnose page content', () => {
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

  test('get page content', async ({ page }) => {
    await page.goto('http://localhost:5173/projects', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    await page.waitForTimeout(8000);
    await page.waitForLoadState('networkidle');

    console.log('Current URL:', page.url());
    
    // 获取所有可见文本
    const textContent = await page.textContent('body');
    console.log('=== 页面所有可见文本 ===');
    console.log(textContent);
    console.log('=== 结束 ===');
    console.log('');
    console.log('包含"创建项目"?:', textContent.includes('创建项目'));
    console.log('包含"项目管理"?:', textContent.includes('项目管理'));
    console.log('包含"404"?:', textContent.includes('404'));
    
    // 获取所有按钮
    const buttons = await page.locator('button').all();
    console.log('');
    console.log('按钮数量:', buttons.length);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const visible = await buttons[i].isVisible();
      console.log(`  Button ${i}: "${text}" visible=${visible}`);
    }
  });
});
