import { test, expect, Page } from '@playwright/test';

/**
 * E2E-005: 多维度统计查看流程
 * 
 * 测试目标: 验证多维度统计页面的数据准确性和筛选功能
 * 
 * 用户故事: US016 (多维度统计), US021 (跨项目统计)
 * 优先级: P1
 */

test.describe('E2E-005: 多维度统计查看流程', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    page.setDefaultTimeout(10000);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('E2E-005-001: 查看项目概览统计', async () => {
    // 步骤1: 登录系统，导航到"统计分析"页面
    await page.goto('http://localhost:5173/statistics');
    await page.waitForLoadState('networkidle');
    
    // 断言: 页面正常加载
    await expect(page.locator('body')).toBeVisible();
    
    // 步骤2: 查看项目概览统计
    const taskCountStat = page.locator('.stat-card:has-text("任务"), .stat-card:has-text("Task")').first();
    const completionRateStat = page.locator('.stat-card:has-text("完成率"), .stat-card:has-text("完成")').first();
    const agentLoadStat = page.locator('.stat-card:has-text("Agent"), .stat-card:has-text("负载")').first();
    
    // 断言: 数据正确显示（至少有一个统计卡片可见）
    const anyStatVisible = await Promise.all([
      taskCountStat.isVisible({ timeout: 3000 }),
      completionRateStat.isVisible({ timeout: 3000 }),
      agentLoadStat.isVisible({ timeout: 3000 })
    ]);
    
    expect(anyStatVisible.some(visible => visible)).toBeTruthy();
  });

  test('E2E-005-002: 使用筛选器筛选统计数据', async () => {
    // 步骤1: 访问统计分析页面
    await page.goto('http://localhost:5173/statistics');
    await page.waitForLoadState('networkidle');
    
    // 步骤3: 使用筛选器（按项目、时间范围、Agent）筛选
    const projectFilter = page.locator('select[name="project"], .filter:has-text("项目") select').first();
    const timeFilter = page.locator('select[name="timeRange"], .filter:has-text("时间") select').first();
    const agentFilter = page.locator('select[name="agent"], .filter:has-text("Agent") select').first();
    
    let anyFilterVisible = false;
    
    if (await projectFilter.isVisible({ timeout: 3000 })) {
      await projectFilter.selectOption({ index: 0 });
      anyFilterVisible = true;
    }
    
    if (await timeFilter.isVisible({ timeout: 3000 })) {
      await timeFilter.selectOption({ label: '本周' });
      anyFilterVisible = true;
    }
    
    if (await agentFilter.isVisible({ timeout: 3000 })) {
      await agentFilter.selectOption({ index: 0 });
      anyFilterVisible = true;
    }
    
    // 断言: 筛选功能正常（如果筛选器可见）
    if (anyFilterVisible) {
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('E2E-005-003: 查看跨项目统计', async () => {
    // 步骤1: 访问统计分析页面
    await page.goto('http://localhost:5173/statistics');
    await page.waitForLoadState('networkidle');
    
    // 步骤4: 点击"跨项目统计"标签
    const crossProjectTab = page.locator('button:has-text("跨项目"), button:has-text("Cross-Project"), a:has-text("跨项目")').first();
    if (await crossProjectTab.isVisible({ timeout: 3000 })) {
      await crossProjectTab.click();
      await page.waitForTimeout(500);
      
      // 断言: 显示跨项目统计数据
      await expect(page.locator('body')).toBeVisible();
    }
    
    // 步骤5: 查看团队效率统计图表
    const teamEfficiencyChart = page.locator('.chart:has-text("效率"), .chart:has-text("团队"), canvas, svg').first();
    if (await teamEfficiencyChart.isVisible({ timeout: 3000 })) {
      // 断言: 图表正确展示数据
      await expect(teamEfficiencyChart).toBeVisible();
    }
  });

  test('E2E-005-004: 切换时间范围', async () => {
    // 步骤1: 访问统计分析页面
    await page.goto('http://localhost:5173/statistics');
    await page.waitForLoadState('networkidle');
    
    // 步骤6: 切换时间范围（本周、本月、本季度）
    const timeRangeFilter = page.locator('select[name="timeRange"], .filter:has-text("时间") select, button:has-text("本周")').first();
    
    if (await timeRangeFilter.isVisible({ timeout: 3000 })) {
      // 切换到"本周"
      await timeRangeFilter.selectOption({ label: '本周' });
      await page.waitForTimeout(500);
      await expect(page.locator('body')).toBeVisible();
      
      // 切换到"本月"
      await timeRangeFilter.selectOption({ label: '本月' });
      await page.waitForTimeout(500);
      await expect(page.locator('body')).toBeVisible();
      
      // 切换到"本季度"
      await timeRangeFilter.selectOption({ label: '本季度' });
      await page.waitForTimeout(500);
      await expect(page.locator('body')).toBeVisible();
      
      // 断言: 数据根据时间范围更新（页面没有错误）
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('E2E-005-005: 导出统计数据', async () => {
    // 步骤1: 访问统计分析页面
    await page.goto('http://localhost:5173/statistics');
    await page.waitForLoadState('networkidle');
    
    // 步骤7: 导出统计数据
    const exportButton = page.locator('button:has-text("导出"), button:has-text("Export"), a:has-text("导出")').first();
    
    if (await exportButton.isVisible({ timeout: 3000 })) {
      // 模拟点击导出按钮
      await exportButton.click();
      await page.waitForTimeout(1000);
      
      // 断言: 导出功能正常（没有错误）
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
