
// 项目类型定义
export interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "archived" | "overdue";
  priority: "P0" | "P1" | "P2" | "P3";
  managerId: string;
  manager?: string;
  startDate: string;
  endDate: string;
  progress: number;
  taskCount: number;
  tasks: {
    total: number;
    unassigned: number;
    inProgress: number;
    completed: number;
    blocked: number;
  };
  createdAt: string;
  updatedAt: string;
}

// 任务类型定义
export interface Task {
  id: string;
  name: string;
  description: string;
  status: "unassigned" | "inProgress" | "blocked" | "pendingReview" | "reviewed" | "cancelled";
  priority: "P0" | "P1" | "P2" | "P3";
  assignee: string;
  projectId: string;
  startDate: string;
  endDate: string;
  progress: number;
  dependencies: string[];
  deliverables: Deliverable[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

// 交付物类型定义
export interface Deliverable {
  id: string;
  name: string;
  type: "document" | "code" | "image" | "report" | "other";
  url: string;
  version: string;
  uploadedBy: string;
  uploadedAt: string;
  comments: string;
}

// 评论类型定义
export interface Comment {
  id: string;
  content: string;
  author: string;
  authorType: "agent" | "human";
  createdAt: string;
  replies: Comment[];
}

// 死信事件类型定义
export interface DeadLetterEvent {
  id: string;
  subscriptionId: string;
  eventType: string;
  eventPayload: any;
  lastError: string;
  retryCount: number;
  createdAt: string;
  lastAttemptAt: string;
  expireAt: string;
}

// 死信列表响应类型
export interface DeadLetterListResponse {
  items: DeadLetterEvent[];
  total: number;
  page: number;
  pageSize: number;
}

// API密钥类型定义
export interface ApiKey {
  id: string;
  agentId: string;
  name: string;
  maskedKey: string;
  status: "active" | "expired" | "revoked";
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  lastUsedAt: string | null;
  isActive: boolean;
}

// 创建API密钥响应
export interface ApiKeyCreateResponse {
  id: string;
  apiKey: string;
  maskedKey: string;
  agentId: string;
  expiresAt: string | null;
  createdAt: string;
}

// 旋转API密钥响应
export interface ApiKeyRotateResponse {
  id: string;
  apiKey: string;
  maskedKey: string;
  expiresAt: string | null;
  createdAt: string;
}

// 项目统计类型定义
export interface ProjectStatistics {
  projectId: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  inProgressTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  blockingIssues: {
    taskId: string;
    blockReason: string;
    relatedTasks: string[];
    blockedDays: number;
  }[];
  memberWorkload: {
    agentId: string;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
  }[];
  taskTrend: {
    date: string;
    tasksCreated: number;
    tasksCompleted: number;
  }[];
}

// Agent统计
export interface AgentStat {
  agentId: string;
  agentName: string;
  agentType: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  avgCompletionTime: number;
  overdueTasks: number;
}

// 项目统计
export interface ProjectStat {
  projectId: string;
  projectName: string;
  status: string;
  priority: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  inProgressTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  startDate: string;
  endDate: string;
}

// 跨项目统计响应
export interface CrossProjectStats {
  summary: {
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    inProgressTasks: number;
    blockedTasks: number;
    overdueTasks: number;
  };
  agentStats: AgentStat[];
  projectStats: ProjectStat[];
}

// 审计日志类型定义
export interface AuditLog {
  id: string;
  action: "create" | "update" | "delete" | "query" | "assign" | "review";
  resourceType: "project" | "task" | "user" | "system";
  resourceId: string;
  actor: string;
  actorType: "agent" | "human";
  ip: string;
  timestamp: string;
  status: "success" | "failed" | "warning";
  details: {
    request?: any;
    response?: any;
    error?: string;
  };
}

// 实时概览统计数据类型 - 后端返回 snake_case
export interface Statistics {
  total_projects: number;
  total_tasks: number;
  completed_tasks: number;
  blocked_tasks: number;
  pending_dead_letters: number;
}

// 完整统计数据类型 - camelCase 用于 Analytics
export interface FullStatistics {
  activeProjects: number;
  pendingReviewTasks: number;
  blockedTasks: number;
  averageDeliveryTime: number;
  projectTrend: {
    date: string;
    value: number;
  }[];
  agentWorkload: {
    name: string;
    type: string;
    tasks: number;
  }[];
  taskStatusDistribution: {
    status: string;
    count: number;
  }[];
  projectEfficiency: {
    projectId: string;
    name: string;
    efficiency: number;
  }[];
}

// 用户类型定义
export interface User {
  id: string;
  name: string;
  type: "agent" | "human";
  role: "admin" | "manager" | "developer" | "tester" | "viewer";
  email: string;
  avatar: string;
  lastLogin: string;
}

// API响应类型定义
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

// DeadLetterListResponse already has items, code expects list - need to update code to items

