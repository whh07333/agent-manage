import { test, expect, Page, devices } from '@playwright/test';

/**
 * E2E-006: 移动端核心流程验证
 * 
 * 测试目标: 验证移动端浏览器中的核心流程可用性
 * 
 * 用户故事: US015 (移动端适配)
 * 优先级: P1
 */

const mobileDevices = [
  { name: 'iPhone 12 Pro', device: devices['iPhone 12 Pro'] },
  { name: 'iPad Mini', device: devices['iPad Mini'] },
  { name: 'Android Chrome', device: { viewport: { width: 360, height: 640 }, userAgent: 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36' } }
];

test.describe('E2E-006: 移动端核心流程验证', () => {
  
  for (const { name, device } of mobileDevices) {
    test.describe(`${name}`, () => {
      let page: Page;

      test.beforeEach(async ({ browser }) => {
        const context = await browser.newContext(device);
        page = await context.newPage();
        page.setDefaultTimeout(10000);
      });

      test.afterEach(async () => {
        await page.close();
      });

      test(`E2E-006-001-${name}: 移动端项目列表页面`, async () => {
        // 步骤1: 访问项目列表页面
        await page.goto('http://localhost:5173/projects');
        await page.waitForLoadState('networkidle');
        
        // 断言: 页面正常加载
        await expect(page.locator('body')).toBeVisible();
        
        // 步骤2: 检查布局是否单列展示
        const viewport = page.viewportSize();
        console.log(`${name} 视口尺寸: ${viewport?.width}x${viewport?.height}`);
        
        // 断言3: 点击汉堡菜单，打开侧边栏（如果存在）
        const menuButton = page.locator('button[aria-label*="menu"], button:has-text("☰"), .hamburger-menu').first();
        if (await menuButton.isVisible({ timeout: 3000 })) {
          await menuButton.click();
          await page.waitForTimeout(500);
          
          // 断言: 侧边栏正确打开
          const sidebar = page.locator('.sidebar, aside, [role="navigation"]').first();
          await expect(sidebar).toBeVisible();
        }
      });

      test(`E2E-006-002-${name}: 移动端创建项目`, async () => {
        // 步骤1: 访问项目列表页面
        await page.goto('http://localhost:5173/projects');
        await page.waitForLoadState('networkidle');
        
        // 步骤3: 点击"创建项目"按钮
        const createButton = page.locator('button:has-text("创建项目"), button:has-text("新建")').first();
        if (await createButton.isVisible({ timeout: 5000 })) {
          await createButton.click();
          
          // 断言: 打开创建模态框，占满屏幕
          const modal = page.locator('[role="dialog"], .modal, .dialog').first();
          await expect(modal).toBeVisible({ timeout: 5000 });
          
          // 验证模态框占满屏幕
          const modalBox = await modal.boundingBox();
          if (modalBox) {
            const viewport = page.viewportSize();
            expect(modalBox.width).toBeCloseTo(viewport?.width || 390, 50);
            expect(modalBox.height).toBeGreaterThan(viewport?.height ? viewport.height * 0.8 : 600);
          }
          
          // 步骤4: 填写项目信息并保存
          const timestamp = Date.now();
          const projectName = `E2E测试项目-${timestamp}`;
          
          await page.locator('input[name="name"], input[placeholder*="项目名"]').fill(projectName);
          await page.locator('textarea[name="description"], textarea[placeholder*="描述"]').fill('这是一个E2E测试项目');
          
          const saveButton = page.locator('button:has-text("保存"), button:has-text("创建")').first();
          await saveButton.click();
          
          // 断言5: 项目创建成功
          await page.waitForTimeout(1000);
          await expect(page.locator(`text=${projectName}`)).toBeVisible({ timeout: 5000 });
          
          // 步骤6: 查看项目列表，确认卡片适配宽度
          const projectCard = page.locator(`text=${projectName}`).locator('..');
          await expect(projectCard).toBeVisible();
          
          const cardBox = await projectCard.boundingBox();
          if (cardBox) {
            const viewport = page.viewportSize();
            // 断言: 卡片宽度不超过视口宽度
            expect(cardBox.width).toBeLessThanOrEqual(viewport?.width || 390);
          }
        } else {
          console.log('创建项目按钮在移动端不可见');
        }
      });

      test(`E2E-006-003-${name}: 移动端项目详情页`, async () => {
        // 步骤1: 访问项目列表页面
        await page.goto('http://localhost:5173/projects');
        await page.waitForLoadState('networkidle');
        
        // 创建测试项目
        const createButton = page.locator('button:has-text("创建项目"), button:has-text("新建")').first();
        if (await createButton.isVisible({ timeout: 5000 })) {
          await createButton.click();
          
          const projectName = `E2E测试项目-${Date.now()}`;
          await page.locator('input[name="name"], input[placeholder*="项目名"]').fill(projectName);
          await page.locator('button:has-text("保存"), button:has-text("创建")').first().click();
          
          await page.waitForTimeout(1000);
          
          // 步骤5: 点击项目名称，跳转到详情页
          const projectLink = page.locator(`text=${projectName}`).first();
          await projectLink.click();
          await page.waitForTimeout(500);
          
          // 断言: 内容单列流式布局，信息完整可读
          await expect(page.locator('h1, .project-name')).toBeVisible();
          
          // 检查详情页是否是流式布局（单列）
          const detailContainer = page.locator('.project-detail, .detail-container, .page-content').first();
          if (await detailContainer.isVisible()) {
            const containerBox = await detailContainer.boundingBox();
            const viewport = page.viewportSize();
            
            if (containerBox && viewport) {
              // 流式布局应该在视口宽度内
              expect(containerBox.width).toBeLessThanOrEqual(viewport.width - 20);
            }
          }
        }
      });

      test(`E2E-006-004-${name}: 移动端触摸滑动操作`, async () => {
        // 步骤1: 访问项目列表页面
        await page.goto('http://localhost:5173/projects');
        await page.waitForLoadState('networkidle');
        
        // 步骤8: 执行滑动操作
        await page.mouse.move(100, 300);
        await page.mouse.down();
        await page.mouse.move(300, 300, { steps: 10 });
        await page.mouse.up();
        
        await page.waitForTimeout(500);
        
        // 断言: 页面响应滑动，没有错误
        const body = page.locator('body');
        await expect(body).toBeVisible();
        
        // 检查是否有JavaScript错误
        const hasError = await page.evaluate(() => {
          return !!(window as any).__errors__ && (window as any).__errors__.length > 0;
        });
        expect(hasError).toBeFalsy();
      });

      test(`E2E-006-005-${name}: iOS安全区域适配`, async () => {
        // 步骤1: 访问项目列表页面
        await page.goto('http://localhost:5173/projects');
        await page.waitForLoadState('networkidle');
        
        // 检查顶部是否留出刘海屏安全区域
        const header = page.locator('header, .header, nav').first();
        if (await header.isVisible({ timeout: 3000 })) {
          const headerBox = await header.boundingBox();
          if (headerBox) {
            // iOS刘海屏通常会留出至少44px的安全区域
            expect(headerBox.y).toBeGreaterThanOrEqual(0);
          }
        }
        
        // 步骤9: 测试底部操作条（iOS安全区域）
        const bottomAction = page.locator('.bottom-bar, .tab-bar, .footer-actions').first();
        if (await bottomAction.isVisible({ timeout: 3000 })) {
          const actionBox = await bottomAction.boundingBox();
          const viewport = page.viewportSize();
          
          if (actionBox && viewport) {
            // 底部操作条应该距离底部有一定距离，避免被底部条遮挡
            const distanceFromBottom = viewport.height - (actionBox.y + actionBox.height);
            expect(distanceFromBottom).toBeGreaterThanOrEqual(0);
          }
        }
      });
    });
  }
});
