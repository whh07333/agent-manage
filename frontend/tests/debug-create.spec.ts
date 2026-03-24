import { test, expect } from '@playwright/test';

// 新生成的有效token
const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsImlhdCI6MTc3NDIzMjMzNSwiZXhwIjoxNzc0ODM3MTM1fQ.cyrkH4oRP5uMLpFzasFhai64rqfam4BLjTWdX0FDQ-I';

test.describe('Debug project creation', () => {
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

  test('debug create project flow', async ({ page }) => {
    await page.goto('http://localhost:5173/projects', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    await page.waitForTimeout(5000);

    console.log('✓ Page loaded');

    // 打开创建模态框
    await page.getByText('创建项目').first().click();
    await page.waitForTimeout(2000);

    console.log('✓ Modal opened');

    // 填写表单
    const projectName = 'CRUD Test Full E2E ' + Date.now();
    await page.fill('input[placeholder="请输入项目名称"]', projectName);
    await page.fill('textarea[placeholder="请输入项目描述"]', '完整CRUD流程自动化E2E测试');
    await page.fill('input[placeholder="请输入项目负责人"]', '自动化测试Agent');

    console.log('✓ Form filled');

    // 选择日期
    await page.click('.ant-picker-input input[placeholder="选择开始日期"]');
    await page.waitForTimeout(1000);
    await page.locator('.ant-picker-panel:visible .ant-picker-cell-inner').first().click();
    await page.waitForTimeout(500);

    await page.click('.ant-picker-input input[placeholder="选择结束日期"]');
    await page.waitForTimeout(1000);
    await page.locator('.ant-picker-panel:visible .ant-picker-cell-inner').nth(5).click();
    await page.waitForTimeout(500);

    await page.click('button:has-text("P1 - 高")');
    console.log('✓ Priority selected');

    // 监听创建请求
    const createRequestPromise = page.waitForRequest(request => 
      request.url().includes('/api/projects') && request.method() === 'POST'
    );

    // 点击创建
    await page.locator('.ant-modal').getByText('创建项目').click();
    console.log('✓ Create button clicked');

    // 等待请求
    const createRequest = await createRequestPromise;
    console.log('✓ Create request sent:', createRequest.url());

    // 等待响应
    const response = await createRequest.response();
    if (response) {
      console.log('Response status:', response.status());
      const responseBody = await response.body();
      console.log('Response body:', responseBody.toString());
    }

    await page.waitForTimeout(5000);

    const modalVisible = await page.locator('.ant-modal').isVisible();
    console.log('Modal still visible after create:', modalVisible);

    const items = page.locator('.ant-list-item');
    const count = await items.count();
    console.log('Project items count:', count);
  });
});
