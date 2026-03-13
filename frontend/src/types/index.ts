// 项目类型定义
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived' | 'overdue';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  manager: string;
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
  status: 'unassigned' | 'inProgress' | 'blocked' | 'pendingReview' | 'reviewed' | 'cancelled';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
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
  type: 'document' | 'code' | 'image' | 'report' | 'other';
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
  authorType: 'agent' | 'human';
  createdAt: string;
  replies: Comment[];
}

// 审计日志类型定义
export interface AuditLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'query' | 'assign' | 'review';
  resourceType: 'project' | 'task' | 'user' | 'system';
  resourceId: string;
  actor: string;
  actorType: 'agent' | 'human';
  ip: string;
  timestamp: string;
  status: 'success' | 'failed' | 'warning';
  details: {
    request?: any;
    response?: any;
    error?: string;
  };
}

// 统计数据类型定义
export interface Statistics {
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
  type: 'agent' | 'human';
  role: 'admin' | 'manager' | 'developer' | 'tester' | 'viewer';
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
