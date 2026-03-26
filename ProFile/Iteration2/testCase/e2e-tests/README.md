# 迭代2 E2E端到端测试脚本

## 文件列表

| 文件名 | 描述 |
|--------|------|
| `e2e-001-project-management.spec.ts` | 项目管理完整CRUD流程 (US002, US003) |
| `e2e-002-task-approval.spec.ts` | 任务验收完整流程 (US008) |
| `e2e-006-mobile.spec.ts` | 移动端核心流程验证 (US015) |
| `e2e-004-realtime-monitoring.spec.ts` | 实时监控看板查看流程 (US022) |
| `e2e-005-statistics.spec.ts` | 多维度统计查看流程 (US016, US021) |

## 环境要求

- Node.js >= 18
- Playwright >= 1.40.0
- 后端服务运行在 http://localhost:3001
- 前端服务运行在 http://localhost:5173

## 安装依赖

```bash
cd /Users/whh073/.openclaw/project/AgentManage/ProFile/Iteration2/testCase/e2e-tests
npm install @playwright/test
npx playwright install chromium
```

## 运行测试

### 运行所有E2E测试

```bash
npx playwright test
```

### 运行特定测试文件

```bash
npx playwright test e2e-001-project-management.spec.ts
```

### 运行特定测试用例

```bash
npx playwright test -g "E2E-001-001"
```

### 查看测试报告

```bash
npx playwright show-report
```

### 调试模式（UI模式）

```bash
npx playwright test --ui
```

### 慢动作模式（用于调试）

```bash
npx playwright test --headed --slow-mo=1000
```

## 测试覆盖范围

| E2E测试ID | 测试场景 | 用户故事 | 优先级 |
|-----------|---------|---------|--------|
| E2E-001 | 项目管理完整CRUD流程 | US002, US003 | 🔴 P1 |
| E2E-002 | 任务验收完整流程 | US008 | 🔴 P1 |
| E2E-004 | 实时监控看板查看流程 | US022 | 🔴 P1 |
| E2E-005 | 多维度统计查看流程 | US016, US021 | 🔴 P1 |
| E2E-006 | 移动端核心流程验证 | US015 | 🔴 P1 |

## 注意事项

1. **测试独立性**: 每个测试用例都会创建新的浏览器上下文，不互相影响
2. **数据清理**: 测试会创建测试数据，建议在测试完成后清理
3. **失败重试**: 某些UI操作可能因网络延迟失败，可以配置重试次数
4. **截图和视频**: 测试失败时会自动保存截图和视频用于分析

## 配置文件

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

## 常见问题

### Q: 测试失败，提示"元素不可见"
A: 可能是页面加载未完成，尝试增加等待时间或调整选择器

### Q: 测试失败，提示"超时"
A: 检查前后端服务是否正常运行，网络连接是否正常

### Q: 测试在移动端失败
A: 移动端某些功能可能还未实现，这是预期行为

## 测试报告位置

测试报告默认生成在 `playwright-report/` 目录
测试截图和视频生成在 `test-results/` 目录

---

*创建时间: 2026-03-25*
*创建人: Lisa 🔍*
