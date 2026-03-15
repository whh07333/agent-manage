# 项目创建API文档 (US001)

## 概述
本文档描述了项目创建API的详细规范，这是Iteration1的US001用户故事实现。

## API端点

### 创建项目
- **方法**: POST
- **路径**: `/api/projects`
- **认证**: 需要Bearer Token (在Authorization头中)
- **内容类型**: `application/json`

#### 请求示例
```json
{
  "name": "茶叶跨境ERP系统",
  "description": "为茶叶行业开发的跨境SaaS ERP系统",
  "manager_id": "550e8400-e29b-41d4-a716-446655440000",
  "priority": "high",
  "status": "active",
  "due_date": "2026-12-31"
}
```

#### 请求字段说明
| 字段名 | 类型 | 必需 | 默认值 | 说明 | 验证规则 |
|--------|------|------|--------|------|----------|
| name | string | 是 | - | 项目名称 | 2-255个字符 |
| description | string | 否 | null | 项目描述 | 文本格式 |
| manager_id | string (UUID) | 是 | - | 项目经理ID | 必须对应存在的活跃用户 |
| priority | string | 否 | "medium" | 优先级 | 必须是: low, medium, high |
| status | string | 否 | "active" | 项目状态 | 必须是: active, inactive, archived |
| due_date | string (ISO日期) | 否 | null | 截止日期 | 必须是有效日期，不能是过去日期 |

#### 成功响应 (201 Created)
```json
{
  "code": 0,
  "msg": "Project created successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "茶叶跨境ERP系统",
    "description": "为茶叶行业开发的跨境SaaS ERP系统",
    "manager_id": "550e8400-e29b-41d4-a716-446655440000",
    "priority": "high",
    "status": "active",
    "due_date": "2026-12-31T00:00:00.000Z",
    "is_archived": false,
    "created_at": "2026-03-14T10:30:00.000Z",
    "updated_at": "2026-03-14T10:30:00.000Z"
  },
  "trace_id": "req-123456",
  "timestamp": "2026-03-14T10:30:00.000Z"
}
```

#### 错误响应

**400 Bad Request** - 输入验证失败
```json
{
  "code": 400,
  "msg": "Project name is required, Priority must be one of: low, medium, high",
  "data": null,
  "trace_id": "req-123456",
  "timestamp": "2026-03-14T10:30:00.000Z"
}
```

**404 Not Found** - 经理不存在或不活跃
```json
{
  "code": 404,
  "msg": "Manager with ID 550e8400-e29b-41d4-a716-446655440000 not found",
  "data": null,
  "trace_id": "req-123456",
  "timestamp": "2026-03-14T10:30:00.000Z"
}
```

**401 Unauthorized** - 认证失败
```json
{
  "code": 401,
  "msg": "Authorization header required",
  "data": null,
  "trace_id": "req-123456",
  "timestamp": "2026-03-14T10:30:00.000Z"
}
```

**500 Internal Server Error** - 服务器错误
```json
{
  "code": 500,
  "msg": "Internal server error",
  "data": null,
  "trace_id": "req-123456",
  "timestamp": "2026-03-14T10:30:00.000Z"
}
```

## 相关API端点

### 获取所有项目
- **方法**: GET
- **路径**: `/api/projects`
- **认证**: 需要Bearer Token

### 获取单个项目
- **方法**: GET
- **路径**: `/api/projects/:id`
- **认证**: 需要Bearer Token

### 更新项目
- **方法**: PUT
- **路径**: `/api/projects/:id`
- **认证**: 需要Bearer Token

### 删除项目
- **方法**: DELETE
- **路径**: `/api/projects/:id`
- **认证**: 需要Bearer Token

### 归档项目
- **方法**: POST
- **路径**: `/api/projects/:id/archive`
- **认证**: 需要Bearer Token

## 数据模型

### Project 模型字段
```typescript
id: string (UUID) - 主键
name: string - 项目名称
description: string | null - 项目描述
manager_id: string (UUID) - 项目经理ID
priority: string - 优先级 (low, medium, high)
status: string - 状态 (active, inactive, archived)
due_date: Date | null - 截止日期
is_archived: boolean - 是否归档
created_at: Date - 创建时间
updated_at: Date - 更新时间
```

## 验证规则

### 项目名称
- 必需字段
- 不能为空或纯空格
- 长度: 2-255个字符

### 经理ID
- 必需字段
- 必须是有效的UUID格式
- 必须对应系统中存在的用户
- 用户必须处于活跃状态 (is_active = true)

### 优先级
- 可选字段，默认值: "medium"
- 必须是: "low", "medium", "high"

### 状态
- 可选字段，默认值: "active"
- 必须是: "active", "inactive", "archived"

### 截止日期
- 可选字段
- 必须是有效的日期格式
- 不能是过去日期（创建时验证）

## 实现说明

### 技术栈
- **运行时**: Node.js + Express
- **数据库**: PostgreSQL + Sequelize ORM
- **认证**: JWT (JSON Web Token)
- **语言**: TypeScript

### 代码结构
```
src/
├── controllers/projects.ts      # 项目控制器
├── services/projects.ts         # 项目服务层
├── models/Project.ts           # 项目数据模型
├── types/project.ts            # 类型定义
├── utils/validation.ts         # 验证工具
├── routes/projects.ts          # 项目路由
└── middleware/auth.ts          # 认证中间件
```

### 关键改进
1. **输入验证**: 使用集中式验证工具，确保数据完整性
2. **错误处理**: 细粒度的错误分类和适当的HTTP状态码
3. **数据验证**: 验证manager_id对应的用户存在且活跃
4. **响应标准化**: 所有API响应遵循统一格式
5. **安全性**: 所有端点都受JWT认证保护

## 测试建议

### 单元测试
- 验证createProject方法的输入验证逻辑
- 验证manager_id用户存在性检查
- 验证错误处理逻辑

### 集成测试
- 测试完整的API端点（创建、读取、更新、删除）
- 测试认证和授权
- 测试边界情况（无效输入、缺失字段等）

### 端到端测试
- 模拟完整用户流程：登录 → 创建项目 → 查看项目 → 更新项目 → 归档项目
- 测试并发操作
- 测试性能（响应时间、吞吐量）