import { test } from '@playwright/test';

// 新生成的有效token
const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlhdCI6MTc3NDgyMTg0MiwiZXhwIjoxNzc0ODY2NjgyfQ.PtCq0uk4GWu0W_0dzocyg-DIvxFHAp55qC7lax3tpfw';

test.describe('Debug token', () => {
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

  test('debug token after table fix', async ({ page }) => {
    await page.goto('http://localhost:5173/projects', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    await page.waitForTimeout(8000);

    console.log('Current URL after goto:', page.url());
    const url = page.url();
    
    if (url.includes('/login')) {
      console.log('❌ Still redirected to login');
    } else {
      console.log('✓ Not redirected, token valid');
    }

    const hasCreateText = await page.getByText('创建项目').isVisible();
    console.log('Has "创建项目" visible:', hasCreateText);

    const bodyText = await page.textContent('body');
    console.log('Contains 404:', bodyText.includes('404'));
    console.log('Contains "项目管理":', bodyText.includes('项目管理'));
  });
});
