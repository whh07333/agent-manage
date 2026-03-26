import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  fullyParallel: false,  // UI模式不支持并行
  forbidOnly: false,  // 允许运行特定测试
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    headless: false,  // 使用有头模式
    actionTimeout: 30000,  // 增加操作超时时间
    navigationTimeout: 30000,  // 增加导航超时时间
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },  // 使用更大的视口
      },
    },
  ],
});
