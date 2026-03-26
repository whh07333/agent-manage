// 迭代2类型定义 - 对齐后端类型定义文档
// 文档位置: ProFile/tecSolu/迭代2类型定义文档.md

// ========== 枚举类型定义 ==========

// 任务优先级
export type TaskPriority = 'low' | 'medium' | 'high';

// 任务状态
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';

// 项目优先级
export type ProjectPriority = 'low' | 'medium' | 'high';

// 项目状态
export type ProjectStatus = 'active' | 'inactive' | 'archived';

// API密钥状态
export type ApiKeyStatus = 'active' | 'revoked';

// ========== 核心类型定义 ==========

// Project（项目）
export interface Project {
  id: string;
  name: string;
  description?: string | null;
  managerId: string;
  priority: ProjectPriority;
  status: ProjectStatus;
  startDate?: Date | null;
  endDate?: Date | null;
  dueDate?: Date | null;
  isArchived: boolean;
  archiveNote?: string | null;
  archivedAt?: Date | null;
  archivedBy?: string | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  managerId: string;
  priority?: ProjectPriority;
  status?: ProjectStatus;
  dueDate?: Date | string;
  isArchived?: boolean;
  agentIds?: string[];
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  managerId?: string;
  priority?: ProjectPriority;
  status?: ProjectStatus;
  dueDate?: Date | string;
  isArchived?: boolean;
  agentIds?: string[];
}

// Task（任务）
export interface Task {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  assigneeId?: string;
  parentId?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  statusRemark?: string | null;
  dueDate?: Date | null;
  deliverables?: any[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskRequest {
  projectId: string;
  name: string;
  description?: string;
  assigneeId?: string;
  parentId?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
}

export interface UpdateTaskRequest {
  name?: string;
  description?: string;
  assigneeId?: string;
  parentId?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
}

export interface AcceptTaskRequest {
  assigneeId: string;
}

export interface AcceptanceTaskRequest {
  result: 'approved' | 'rejected';
  comment?: string;
}

export interface BlockTaskRequest {
  blockReason: string;
  relatedTasks?: string[];
}

export interface UnblockTaskRequest {
  comment?: string;
}

export interface TaskStatistics {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  blocked: number;
  cancelled: number;
}

// BlockRecord（阻塞记录）
export interface BlockRecord {
  id: string;
  taskId: string;
  blockReason: string;
  relatedTasks: string[];
  blockedBy: string;
  blockedAt: Date;
  resolvedAt?: Date | null;
  resolvedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBlockRecordRequest {
  taskId: string;
  blockReason: string;
  relatedTasks?: string[];
}

export interface ResolveBlockRecordRequest {
  comment?: string;
}

// Subscription（事件订阅）
export interface Subscription {
  id: string;
  agentId: string;
  agentType: string;
  targetId?: string | null;
  eventType: string;
  callbackUrl: string;
  secret?: string | null;
  isActive: boolean;
  maxRetries: number;
  retryCount: number;
  lastFailedAt?: Date | null;
  retryScheduledAt?: Date | null;
  expireAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionRequest {
  agentId: string;
  agentType: string;
  targetId?: string | null;
  eventType: string;
  callbackUrl: string;
  secret?: string;
  maxRetries?: number;
}

export interface UpdateSubscriptionRequest {
  callbackUrl?: string;
  secret?: string;
  isActive?: boolean;
  maxRetries?: number;
}

export interface RetrySubscriptionRequest {
  subscriptionId: string;
}

// DeadLetterEvent（死信事件）
export interface DeadLetterEvent {
  id: string;
  subscriptionId: string;
  eventType: string;
  eventPayload: Record<string, any>;
  retryCount: number;
  lastError?: string | null;
  lastFailedAt?: Date | null;
  retryScheduledAt?: Date | null;
  expireAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RetryDeadLetterRequest {
  eventId: string;
}

export interface BatchRetryDeadLetterRequest {
  eventIds: string[];
}

// ApiKey（API密钥）
export interface ApiKey {
  id: string;
  agentId: string;
  keyPrefix: string;
  keyHash: string;
  name: string;
  status: ApiKeyStatus;
  lastUsedAt?: Date | null;
  expiresAt?: Date | null;
  createdBy: string;
  isActive: boolean;
  revokedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApiKeyRequest {
  agentId: string;
  name: string;
  expiresAt?: Date;
}

export interface UpdateApiKeyRequest {
  name?: string;
  status?: ApiKeyStatus;
}

export interface RevokeApiKeyRequest {
  keyId: string;
  reason?: string;
}

// AuditLog（审计日志）
export interface AuditLog {
  id: string;
  projectId?: string | null;
  userId?: string | null;
  action: string;
  resourceType: string;
  resourceId: string;
  content?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

export interface CreateAuditLogRequest {
  projectId?: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  content?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface QueryAuditLogsOptions {
  projectId?: string;
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}

// ========== API响应类型 ==========

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}
