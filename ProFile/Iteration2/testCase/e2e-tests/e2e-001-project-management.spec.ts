import { test, expect, Page } from '@playwright/test';

/**
 * E2E项目管理冒烟测试
 * 
 * 测试目标: 验证项目管理核心功能是否存在和可用
 * 测试原则: 只测试功能存在性/可用性，不查找按钮/标签统计
 */

test.describe('E2E项目管理冒烟测试', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    page.setDefaultTimeout(30000);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('E2E-P001: 项目列表页面可用', async () => {
    console.log('=== 开始测试: 项目列表页面可用 ===');
    
    // 访问项目列表页面
    await page.goto('http://localhost:5173/projects');
    await page.waitForLoadState('networkidle');
    
    // 验证页面标题存在
    const pageTitle = page.locator('h1, h2').filter({ hasText: /项目|Project/ });
    await expect(pageTitle).toBeVisible();
    console.log('✓ 项目列表页面标题已显示');
    
    // 验证至少有一个项目存在
    const projects = page.locator('.ant-list-item, .project-item');
    const count = await projects.count();
    expect(count).toBeGreaterThan(0);
    console.log(`✓ 项目列表显示 ${count} 个项目`);
    
    // 验证"创建项目"按钮存在
    const createButton = page.locator('button').filter({ hasText: /创建项目|新建项目|Create/ });
    await expect(createButton).toBeVisible();
    console.log('✓ "创建项目"按钮存在');
  });

  test('E2E-P002: 点击项目卡片能进入详情页', async () => {
    console.log('=== 开始测试: 点击项目卡片能进入详情页 ===');
    
    // 访问项目列表页面
    await page.goto('http://localhost:5173/projects');
    await page.waitForLoadState('networkidle');
    
    // 获取当前URL
    const urlBefore = page.url();
    console.log(`[导航] 点击前URL: ${urlBefore}`);
    
    // 点击第一个项目卡片
    const firstProject = page.locator('.ant-list-item, .project-item').first();
    await firstProject.click();
    console.log('✓ 点击了第一个项目卡片');
    
    // 等待导航发生（最多等待5秒）
    const urlChanged = await Promise.race([
      page.waitForURL(/\/projects\/.+/, { timeout: 5000 }).then(() => true),
      Promise.resolve(false).then(() => new Promise(resolve => setTimeout(() => resolve(false), 5000)))
    ]);
    
    // 验证URL是否变化
    const urlAfter = page.url();
    console.log(`[导航] 点击后URL: ${urlAfter}`);
    
    if (urlChanged) {
      console.log('✓ URL已变化，导航成功');
      
      // 验证任务列表存在
      const taskList = page.locator('.task-list, .ant-list');
      await expect(taskList).toBeVisible({ timeout: 5000 });
      console.log('✓ 任务列表已显示');
    } else {
      console.log('❌ URL未变化，导航失败');
      throw new Error('点击项目卡片后无法导航到详情页');
    }
  });

  test('E2E-P003: 创建项目Modal可用', async () => {
    console.log('=== 开始测试: 创建项目Modal可用 ===');
    
    // 访问项目列表页面
    await page.goto('http://localhost:5173/projects');
    await page.waitForLoadState('networkidle');
    
    // 点击"创建项目"按钮
    const createButton = page.locator('button').filter({ hasText: /创建项目|新建项目|Create/ });
    await createButton.click();
    console.log('✓ 点击了"创建项目"按钮');
    
    // 验证Modal打开
    const modal = page.locator('.ant-modal, .modal, [role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
    console.log('✓ 创建项目Modal已打开');
    
    // 验证必填输入框存在
    const nameInput = page.locator('input').filter({ has: page.locator('label').filter({ hasText: /项目名称|Name/ }) });
    await expect(nameInput).toBeVisible();
    console.log('✓ 项目名称输入框存在');
    
    const descTextarea = page.locator('textarea').filter({ has: page.locator('label').filter({ hasText: /项目描述|Description/ }) });
    await expect(descTextarea).toBeVisible();
    console.log('✓ 项目描述输入框存在');
    
    // 验证保存按钮存在
    const saveButton = page.locator('.ant-modal button').filter({ hasText: /保存|创建|Save/ });
    await expect(saveButton).toBeVisible();
    console.log('✓ 保存按钮存在');
  });
});
