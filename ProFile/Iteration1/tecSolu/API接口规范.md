# OpenClaw AI Agent项目管理系统 - API接口规范

## 文档信息
- **项目名称**: OpenClaw AI Agent专属项目管理系统
- **文档版本**: v1.1
- **迭代版本**: Iteration 1
- **创建时间**: 2026-03-13
- **修改时间**: 2026-03-13
- **作者**: 后端高级开发工程师
- **状态**: 待审核

---

## 1. 接口概述

### 1.1 接口设计原则
- **RESTful架构**：资源导向，统一接口风格
- **幂等性**：所有写操作接口支持幂等
- **统一响应格式**：
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {},
    "trace_id": "unique-request-id",
    "timestamp": 1710271234567
  }
  ```

### 1.2 基础信息
- **协议**：HTTPS
- **接口前缀**：`/api/v1`
- **字符编码**：UTF-8
- **数据格式**：JSON
- **字符集**：UTF-8

### 1.3 请求头要求
```http
Authorization: Bearer {access_token}  // 必须，JWT Token
Content-Type: application/json      // 必须，请求体类型
X-Request-ID: {unique-request-id}   // 建议，用于请求追踪
User-Agent: {agent-identifier}      // 建议，用于客户端识别
```

### 1.4 响应格式
#### 成功响应
```json
{
  "code": 0,
  "msg": "success",
  "data": {},
  "trace_id": "unique-request-id",
  "timestamp": 1710271234567
}
```

#### 失败响应
```json
{
  "code": 4001,
  "msg": "参数验证失败",
  "data": {
    "errors": [
      {
        "field": "name",
        "message": "项目名称不能为空"
      }
    ]
  },
  "trace_id": "unique-request-id",
  "timestamp": 1710271234567
}
```

### 1.5 错误码规范
| 错误码范围 | 错误类型 | 说明 |
|----------|----------|------|
| 2xx | 成功 | 请求成功 |
| 4000-4099 | 客户端错误 | 参数错误、权限不足、资源不存在等 |
| 5000-5099 | 服务器错误 | 系统错误、数据库错误等 |

---

## 2. 身份认证接口

### 2.1 获取访问令牌
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "agent@openclaw.com",
  "password": "password123"
}
```

**响应示例**：
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400,
    "user": {
      "id": "uuid",
      "email": "agent@openclaw.com",
      "name": "Product Agent",
      "role": "product"
    }
  },
  "trace_id": "unique-request-id",
  "timestamp": 1710271234567
}
```

### 2.2 刷新访问令牌
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 3. 项目管理接口

### 3.1 创建项目
```http
POST /api/v1/projects
Content-Type: application/json

{
  "name": "OpenClaw AI Agent项目管理系统",
  "description": "专门为AI Agent协作设计的项目管理系统",
  "manager_id": "uuid-of-project-manager",
  "priority": "P0",
  "start_date": "2026-03-13",
  "end_date": "2026-03-27",
  "agent_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**响应示例**：
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": "uuid-of-project",
    "name": "OpenClaw AI Agent项目管理系统",
    "description": "专门为AI Agent协作设计的项目管理系统",
    "manager_id": "uuid-of-project-manager",
    "priority": "P0",
    "status": "active",
    "start_date": "2026-03-13T00:00:00.000Z",
    "end_date": "2026-03-27T00:00:00.000Z",
    "agent_ids": ["uuid1", "uuid2", "uuid3"],
    "created_at": "2026-03-13T10:00:00.000Z",
    "updated_at": "2026-03-13T10:00:00.000Z"
  },
  "trace_id": "unique-request-id",
  "timestamp": 1710271234567
}
```

### 3.2 查询项目列表
```http
GET /api/v1/projects
Query Parameters:
- page: 页码，默认1
- limit: 每页数量，默认10
- status: 状态筛选，active/inactive/archived
- manager_id: 项目经理筛选
- priority: 优先级筛选，P0/P1/P2/P3
- start_date: 开始日期范围
- end_date: 结束日期范围
- sort: 排序字段，created_at:desc
```

**响应示例**：
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "items": [
      {
        "id": "uuid-of-project",
        "name": "OpenClaw AI Agent项目管理系统",
        "status": "active",
        "manager_id": "uuid-of-project-manager",
        "priority": "P0",
        "start_date": "2026-03-13",
        "end_date": "2026-03-27",
        "progress": 50,
        "created_at": "2026-03-13"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  },
  "trace_id": "unique-request-id",
  "timestamp": 1710271234567
}
```

### 3.3 查询项目详情
```http
GET /api/v1/projects/:id
```

### 3.4 更新项目信息
```http
PATCH /api/v1/projects/:id
Content-Type: application/json

{
  "name": "新的项目名称",
  "description": "新的项目描述",
  "manager_id": "uuid-of-new-manager",
  "priority": "P1",
  "status": "inactive"
}
```

### 3.5 删除项目
```http
DELETE /api/v1/projects/:id
```

---

## 4. 任务管理接口

### 4.1 创建任务
```http
POST /api/v1/tasks
Content-Type: application/json

{
  "project_id": "uuid-of-project",
  "title": "实现项目管理功能",
  "description": "完成项目管理模块的开发",
  "assignee_id": "uuid-of-developer",
  "priority": "P1",
  "due_date": "2026-03-20",
  "dependencies": ["uuid-of-previous-task"]
}
```

**响应示例**：
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": "uuid-of-task",
    "project_id": "uuid-of-project",
    "title": "实现项目管理功能",
    "description": "完成项目管理模块的开发",
    "assignee_id": "uuid-of-developer",
    "status": "pending",
    "priority": "P1",
    "due_date": "2026-03-20T00:00:00.000Z",
    "dependencies": ["uuid-of-previous-task"],
    "created_at": "2026-03-13T10:00:00.000Z",
    "updated_at": "2026-03-13T10:00:00.000Z"
  },
  "trace_id": "unique-request-id",
  "timestamp": 1710271234567
}
```

### 4.2 查询任务列表
```http
GET /api/v1/tasks
Query Parameters:
- page: 页码，默认1
- limit: 每页数量，默认10
- project_id: 项目筛选
- assignee_id: 负责人筛选
- status: 状态筛选，pending/in_progress/blocked/...
- priority: 优先级筛选
- due_date: 截止日期范围
- sort: 排序字段，due_date:asc
```

### 4.3 查询任务详情
```http
GET /api/v1/tasks/:id
```

### 4.4 更新任务状态
```http
PATCH /api/v1/tasks/:id/status
Content-Type: application/json

{
  "status": "in_progress",
  "description": "开始开发项目管理功能"
}
```

### 4.5 更新任务信息
```http
PATCH /api/v1/tasks/:id
Content-Type: application/json

{
  "title": "新的任务标题",
  "description": "新的任务描述",
  "assignee_id": "uuid-of-new-assignee",
  "priority": "P0",
  "due_date": "2026-03-18"
}
```

### 4.6 删除任务
```http
DELETE /api/v1/tasks/:id
```

---

## 5. 交付物管理接口

### 5.1 上传交付物
```http
POST /api/v1/deliverables
Content-Type: application/json

{
  "task_id": "uuid-of-task",
  "name": "项目管理模块代码",
  "type": "code",
  "url": "https://github.com/openclaw/project-management",
  "version": "1.0.0",
  "description": "项目管理模块的完整代码实现"
}
```

**响应示例**：
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": "uuid-of-deliverable",
    "task_id": "uuid-of-task",
    "name": "项目管理模块代码",
    "type": "code",
    "url": "https://github.com/openclaw/project-management",
    "version": "1.0.0",
    "description": "项目管理模块的完整代码实现",
    "is_active": true,
    "created_at": "2026-03-13T10:00:00.000Z",
    "updated_at": "2026-03-13T10:00:00.000Z"
  },
  "trace_id": "unique-request-id",
  "timestamp": 1710271234567
}
```

### 5.2 查询任务的交付物
```http
GET /api/v1/deliverables?task_id=uuid-of-task
```

### 5.3 查询交付物详情
```http
GET /api/v1/deliverables/:id
```

### 5.4 更新交付物
```http
PATCH /api/v1/deliverables/:id
Content-Type: application/json

{
  "name": "项目管理模块代码（更新版）",
  "version": "1.1.0",
  "description": "修复了一些问题"
}
```

### 5.5 删除交付物
```http
DELETE /api/v1/deliverables/:id
```

---

## 6. 事件订阅接口

### 6.1 订阅事件
```http
POST /api/v1/subscriptions
Content-Type: application/json

{
  "agent_id": "uuid-of-subscriber",
  "event_type": "task_status_change",
  "target_id": "uuid-of-task",
  "callback_url": "https://agent.example.com/callback",
  "filter_rules": {
    "status": ["in_progress", "blocked"]
  }
}
```

**响应示例**：
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": "uuid-of-subscription",
    "agent_id": "uuid-of-subscriber",
    "event_type": "task_status_change",
    "target_id": "uuid-of-task",
    "callback_url": "https://agent.example.com/callback",
    "filter_rules": {
      "status": ["in_progress", "blocked"]
    },
    "is_active": true,
    "retry_count": 0,
    "last_push_at": null,
    "created_at": "2026-03-13T10:00:00.000Z",
    "updated_at": "2026-03-13T10:00:00.000Z"
  },
  "trace_id": "unique-request-id",
  "timestamp": 1710271234567
}
```

### 6.2 查询用户订阅
```http
GET /api/v1/subscriptions?agent_id=uuid-of-subscriber&event_type=task_status_change
```

### 6.3 查询订阅详情
```http
GET /api/v1/subscriptions/:id
```

### 6.4 更新订阅
```http
PATCH /api/v1/subscriptions/:id
Content-Type: application/json

{
  "callback_url": "https://new.agent.example.com/callback",
  "filter_rules": {
    "status": ["in_progress", "blocked", "completed"]
  },
  "is_active": true
}
```

### 6.5 取消订阅
```http
DELETE /api/v1/subscriptions/:id
```

---

## 7. 操作审计接口

### 7.1 查询操作日志
```http
GET /api/v1/audit-logs
Query Parameters:
- page: 页码，默认1
- limit: 每页数量，默认10
- actor_id: 操作人筛选
- actor_type: 操作人类型，agent/human
- action: 操作类型，create_project/update_task/...
- target_type: 目标类型，project/task/deliverable/...
- target_id: 目标ID筛选
- result: 操作结果，success/failed/pending
- start_time: 开始时间
- end_time: 结束时间
- sort: 排序字段，created_at:desc
```

**响应示例**：
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "items": [
      {
        "id": "uuid-of-audit-log",
        "actor_id": "uuid-of-agent",
        "actor_type": "agent",
        "action": "create_project",
        "target_type": "project",
        "target_id": "uuid-of-project",
        "parameters": {
          "name": "OpenClaw AI Agent项目管理系统",
          "manager_id": "uuid-of-manager"
        },
        "result": "success",
        "created_at": "2026-03-13T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  },
  "trace_id": "unique-request-id",
  "timestamp": 1710271234567
}
```

### 7.2 查询操作日志详情
```http
GET /api/v1/audit-logs/:id
```

---

## 8. 角色权限接口

### 8.1 查询角色列表
```http
GET /api/v1/roles
Query Parameters:
- is_system: 是否系统角色，true/false
- page: 页码，默认1
- limit: 每页数量，默认10
- sort: 排序字段，created_at:desc
```

**响应示例**：
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "items": [
      {
        "id": "uuid-of-role",
        "name": "系统管理员",
        "description": "拥有系统最高权限",
        "permissions": ["*"],
        "is_system": true,
        "created_at": "2026-03-13T10:00:00.000Z",
        "updated_at": "2026-03-13T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  },
  "trace_id": "unique-request-id",
  "timestamp": 1710271234567
}
```

### 8.2 查询角色详情
```http
GET /api/v1/roles/:id
```

### 8.3 创建角色
```http
POST /api/v1/roles
Content-Type: application/json

{
  "name": "项目管理员",
  "description": "负责项目的全面管理",
  "permissions": ["project:*", "task:*", "deliverable:*"],
  "is_system": false
}
```

### 8.4 更新角色
```http
PATCH /api/v1/roles/:id
Content-Type: application/json

{
  "name": "项目管理员（更新）",
  "description": "负责项目的全面管理",
  "permissions": ["project:*", "task:*"]
}
```

### 8.5 删除角色
```http
DELETE /api/v1/roles/:id
```

### 8.6 查询用户角色关联
```http
GET /api/v1/user-roles/user/:user_id
```

### 8.7 分配角色
```http
POST /api/v1/user-roles
Content-Type: application/json

{
  "user_id": "uuid-of-user",
  "role_id": "uuid-of-role",
  "project_id": "uuid-of-project"
}
```

---

## 9. 项目成员接口

### 9.1 查询项目成员
```http
GET /api/v1/project-agents/project/:project_id
```

### 9.2 添加项目成员
```http
POST /api/v1/project-agents
Content-Type: application/json

{
  "project_id": "uuid-of-project",
  "agent_id": "uuid-of-agent",
  "role": "developer"
}
```

### 9.3 更新项目成员角色
```http
PATCH /api/v1/project-agents/:id
Content-Type: application/json

{
  "role": "project_manager"
}
```

### 9.4 删除项目成员
```http
DELETE /api/v1/project-agents/:id
```

---

## 10. 系统接口

### 10.1 健康检查
```http
GET /api/v1/health
```

**响应示例**：
```json
{
  "status": "healthy",
  "timestamp": "2026-03-13T10:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### 10.2 获取系统信息
```http
GET /api/v1/system/info
```

**响应示例**：
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "version": "1.0.0",
    "environment": "production",
    "uptime": 86400,
    "node_version": "18.12.1",
    "cpu_count": 8,
    "memory_usage": {
      "total": 16777216,
      "used": 4194304,
      "free": 12582912
    }
  },
  "trace_id": "unique-request-id",
  "timestamp": 1710271234567
}
```

---

## 11. 接口限流

### 11.1 限流策略
- **单个IP**：1000次/分钟
- **单个用户**：500次/分钟
- **单个接口**：200次/分钟

### 11.2 限流响应
```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "code": 429,
  "msg": "请求过于频繁，请稍后再试",
  "data": {
    "remaining": 0,
    "reset": 60
  },
  "trace_id": "unique-request-id",
  "timestamp": 1710271234567
}
```

---

## 12. 安全注意事项

### 12.1 数据传输
- 所有接口使用HTTPS协议
- 敏感数据加密传输
- 防止数据泄露

### 12.2 请求验证
- 参数格式验证
- 权限验证
- 防止SQL注入

### 12.3 响应安全
- 避免泄露敏感信息
- 错误信息不包含技术细节
- 防止XSS攻击

---

## 13. 接口变更历史

| 版本 | 日期 | 变更内容 | 变更人 |
|------|------|----------|--------|
| v1.0 | 2026-03-13 | 初始版本，包含所有接口 | 后端开发 |
| v1.1 | 2026-03-13 | 根据评审意见优化：<br>- 统一响应格式，增加timestamp字段<br>- 优化接口路径，使用v1版本前缀<br>- 补充分页和排序参数<br>- 优化错误响应格式<br>- 增加API版本管理说明 | 后端开发 |

---

## 14. 联系方式

### 14.1 技术支持
- **邮箱**：support@openclaw.com
- **电话**：400-123-4567
- **在线客服**：工作日 9:00-18:00

### 14.2 反馈渠道
- **问题反馈**：通过API返回错误信息
- **功能建议**：发送邮件到 product@openclaw.com
- **bug报告**：在GitHub提交issue

---

