# Token配置指南

## 概述
AgentManage前端项目使用环境变量来管理API Token，避免硬编码。

## 环境配置文件

### 开发环境 (`.env.development`)
```
VITE_API_BASE_URL=http://localhost:3001
VITE_DEFAULT_TOKEN=<你的开发Token>
```

### 生产环境 (`.env.production`)
```
VITE_API_BASE_URL=http://localhost:3001
```

## Token获取方式

### 方式1：环境变量（推荐用于开发）
```bash
# 1. 编辑 .env.development 文件
vim .env.development

# 2. 更新 VITE_DEFAULT_TOKEN
VITE_DEFAULT_TOKEN=<新的Token>

# 3. 重启开发服务器
npm run dev
```

### 方式2：正式登录（生产环境推荐）
1. 访问登录页面（待实现）
2. 输入用户名和密码
3. 登录成功后自动存储Token

## Token更新周期

- 开发Token：每7天过期一次
- 生产Token：根据后端配置的过期时间

### 验证配置

检查Token是否生效：
```bash
# 1. 在浏览器控制台检查
console.log(import.meta.env.VITE_DEFAULT_TOKEN)

# 2. 检查网络请求头
打开浏览器开发者工具 -> Network -> 找到 /api/projects 请求
查看 Request Headers 中的 Authorization
```

## 常见问题

### Q: Token过期怎么办？
A: 1. 获取新Token；2. 更新环境变量；3. 重启服务器

### Q: 生产环境没有默认Token？
A: 生产环境必须通过登录页面获取Token，不会暴露敏感信息

### Q: 如何切换开发/生产环境？
A: Vite会根据命令自动选择：
   - `npm run dev` → 使用 .env.development
   - `npm run build` → 使用 .env.production
