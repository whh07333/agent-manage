import { test } from '@playwright/test';

const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlhdCI6MTc3NDIzMjMzNSwiZXhwIjoxNzc0ODM3MTM1fQ.cyrkH4oRP5uMLpFzasFhai64rqfam4BLjTWdX0FDQ-I';

test.describe('Final debug', () => {
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

  test('final debug after db rebuild', async ({ page }) => {
    await page.goto('http://localhost:5173/projects', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    await page.waitForTimeout(5000);

    await page.getByText('创建项目').first().click();
    await page.waitForTimeout(2000);

    const projectName = 'CRUD Test Full E2E ' + Date.now();
    await page.fill('input[placeholder="请输入项目名称"]', projectName);
    await page.fill('textarea[placeholder="请输入项目描述"]', '完整CRUD流程自动化E2E测试');
    await page.fill('input[placeholder="请输入项目负责人名称"]', '自动化测试Agent');

    await page.click('.ant-picker-input input[placeholder="选择开始日期"]');
    await page.waitForTimeout(1000);
    await page.locator('.ant-picker-panel:visible .ant-picker-cell-inner').first().click();
    await page.waitForTimeout(500);

    await page.click('.ant-picker-input input[placeholder="选择结束日期"]');
    await page.waitForTimeout(1000);
    await page.locator('.ant-picker-panel:visible .ant-picker-cell-inner').nth(5).click();
    await page.waitForTimeout(500);

    console.log('✓ Form filled');

    const createRequestPromise = page.waitForResponse(
      response => response.url().includes('/api/projects') && response.request().method() === 'POST'
    );

    await page.click('button:has-text("P1 - 高")');
    console.log('✓ Selected P1-high');

    await page.locator('.ant-modal').getByText('创建项目').click();
    console.log('✓ Create clicked');

    const response = await createRequestPromise;
    console.log('Response status:', response.status());
    const responseBody = await response.body();
    console.log('Response body:', responseBody.toString());

    await page.waitForTimeout(5000);

    const modalVisible = await page.locator('.ant-modal').isVisible();
    console.log('Modal visible:', modalVisible);

    const items = page.locator('.ant-list-item');
    const count = await items.count();
    console.log('Project items count:', count);
  });
});
