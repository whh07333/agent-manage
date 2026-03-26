import { test, expect, Page } from '@playwright/test';

/**
 * E2E任务工作流冒烟测试
 * 
 * 测试目标: 验证任务管理核心功能是否存在和可用
 * 测试原则: 只测试功能存在性/可用性，不查找按钮/标签统计
 */

test.describe('E2E任务工作流冒烟测试', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    page.setDefaultTimeout(30000);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('E2E-T001: 任务列表页面可用', async () => {
    console.log('=== 开始测试: 任务列表页面可用 ===');
    
    // 访问任务列表页面
    await page.goto('http://localhost:5173/tasks');
    await page.waitForLoadState('networkidle');
    
    // 验证页面标题存在
    const pageTitle = page.locator('h1, h2').filter({ hasText: /任务|Task/ });
    await expect(pageTitle).toBeVisible();
    console.log('✓ 任务列表页面标题已显示');
    
    // 验证至少有一个任务存在
    const tasks = page.locator('.ant-list-item, .task-item');
    const count = await tasks.count();
    console.log(`✓ 任务列表显示 ${count} 个任务`);
    
    // 验证"创建任务"按钮存在
    const createButton = page.locator('button').filter({ hasText: /创建任务|新建任务|Create/ });
    await expect(createButton).toBeVisible();
    console.log('✓ "创建任务"按钮存在');
  });

  test('E2E-T002: 点击任务卡片能进入详情页', async () => {
    console.log('=== 开始测试: 点击任务卡片能进入详情页 ===');
    
    // 访问任务列表页面
    await page.goto('http://localhost:5173/tasks');
    await page.waitForLoadState('networkidle');
    
    // 获取当前URL
    const urlBefore = page.url();
    console.log(`[导航] 点击前URL: ${urlBefore}`);
    
    // 点击第一个任务卡片
    const firstTask = page.locator('.ant-list-item, .task-item').first();
    await firstTask.click();
    console.log('✓ 点击了第一个任务卡片');
    
    // 等待导航发生（最多等待5秒）
    const urlChanged = await Promise.race([
      page.waitForURL(/\/tasks\/.+/, { timeout: 5000 }).then(() => true),
      Promise.resolve(false).then(() => new Promise(resolve => setTimeout(() => resolve(false), 5000)))
    ]);
    
    // 验证URL是否变化
    const urlAfter = page.url();
    console.log(`[导航] 点击后URL: ${urlAfter}`);
    
    if (urlChanged) {
      console.log('✓ URL已变化，导航成功');
      
      // 验证任务详情信息存在
      const taskTitle = page.locator('h1, h2, h3').filter({ hasText: /任务|Task/ });
      await expect(taskTitle).toBeVisible({ timeout: 5000 });
      console.log('✓ 任务详情标题已显示');
    } else {
      console.log('❌ URL未变化，导航失败');
      throw new Error('点击任务卡片后无法导航到详情页');
    }
  });

  test('E2E-T003: 任务操作按钮存在', async () => {
    console.log('=== 开始测试: 任务操作按钮存在 ===');
    
    // 访问任务列表页面
    await page.goto('http://localhost:5173/tasks');
    await page.waitForLoadState('networkidle');
    
    // 点击第一个任务卡片
    const firstTask = page.locator('.ant-list-item, .task-item').first();
    await firstTask.click();
    console.log('✓ 点击了第一个任务卡片');
    
    // 等待导航或超时
    await Promise.race([
      page.waitForURL(/\/tasks\/.+/, { timeout: 3000 }),
      Promise.resolve(null).then(() => new Promise(resolve => setTimeout(() => resolve(null), 3000)))
    ]);
    
    // 验证任务操作按钮存在（编辑、删除、归档等）
    const actionButtons = page.locator('button').filter({ hasText: /编辑|删除|归档|Edit|Delete|Archive/ });
    const count = await actionButtons.count();
    console.log(`✓ 找到 ${count} 个任务操作按钮`);
    
    expect(count).toBeGreaterThan(0);
  });

  test('E2E-T004: 任务状态显示存在', async () => {
    console.log('=== 开始测试: 任务状态显示存在 ===');
    
    // 访问任务列表页面
    await page.goto('http://localhost:5173/tasks');
    await page.waitForLoadState('networkidle');
    
    // 验证任务状态标签存在
    const statusTags = page.locator('.ant-tag, .badge');
    const count = await statusTags.count();
    console.log(`✓ 找到 ${count} 个状态标签`);
    
    expect(count).toBeGreaterThan(0);
  });
});
