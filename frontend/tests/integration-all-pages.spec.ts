import { test, expect } from '@playwright/test';

test.describe('联调：其他页面基础验证', () => {
  test('验证 API密钥管理 页面', async ({ page }) => {
    await page.goto('http://localhost:5173/api-keys');
    await page.waitForLoadState('networkidle');
    console.log('✓ API密钥管理 页面已加载');
  });

  test('验证 审计日志 页面', async ({ page }) => {
    await page.goto('http://localhost:5173/audit');
    await page.waitForLoadState('networkidle');
    console.log('✓ 审计日志 页面已加载');
  });

  test('验证 跨项目统计 页面', async ({ page }) => {
    await page.goto('http://localhost:5173/statistics/cross-project');
    await page.waitForLoadState('networkidle');
    console.log('✓ 跨项目统计 页面已加载');
  });

  test('验证 Dashboard 页面', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForLoadState('networkidle');
    console.log('✓ Dashboard 页面已加载');
  });

  test('验证 死信队列管理 页面', async ({ page }) => {
    await page.goto('http://localhost:5173/dead-letter');
    await page.waitForLoadState('networkidle');
    console.log('✓ 死信队列管理 页面已加载');
  });

  test('验证 项目配置 页面', async ({ page }) => {
    await page.goto('http://localhost:5173/projects/config');
    await page.waitForLoadState('networkidle');
    console.log('✓ 项目配置 页面已加载');
  });

  test('验证 项目统计 页面', async ({ page }) => {
    await page.goto('http://localhost:5173/statistics');
    await page.waitForLoadState('networkidle');
    console.log('✓ 项目统计 页面已加载');
  });
});
