// 项目类型定义
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'completed' | 'archived' | 'overdue';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  manager: string;
  start_date: string;
  end_date: string;
  progress: number;
  task_count: number;
  tasks: {
    total: number;
    unassigned: number;
    inProgress: number;
    completed: number;
    blocked: number;
  };
  created_at: string;
  updated_at: string;
}

// 任务类型定义
export interface Task {
  id: string;
  name: string;
  description: string;
  status: 'unassigned' | 'inProgress' | 'blocked' | 'pendingReview' | 'reviewed' | 'cancelled';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  assignee: string;
  project_id: string;
  start_date: string;
  end_date: string;
  progress: number;
  dependencies: string[];
  deliverables: Deliverable[];
  comments: Comment[];
  created_at: string;
  updated_at: string;
}

// 交付物类型定义
export interface Deliverable {
  id: string;
  name: string;
  type: 'document' | 'code' | 'image' | 'report' | 'other';
  url: string;
  version: string;
  uploaded_by: string;
  uploaded_at: string;
  comments: string;
}

// 评论类型定义
export interface Comment {
  id: string;
  content: string;
  author: string;
  author_type: 'agent' | 'human';
  created_at: string;
  replies: Comment[];
}

// 死信事件类型定义
export interface DeadLetterEvent {
  id: string;
  subscription_id: string;
  event_type: string;
  event_payload: any;
  last_error: string;
  retry_count: number;
  created_at: string;
  last_attempt_at: string;
  expire_at: string;
}

// 死信列表响应类型
export interface DeadLetterListResponse {
  items: DeadLetterEvent[];
  total: number;
  page: number;
  page_size: number;
}

// API密钥类型定义
export interface ApiKey {
  id: string;
  agent_id: string;
  name: string;
  masked_key: string;
  status: 'active' | 'expired' | 'revoked';
  created_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  last_used_at: string | null;
  is_active: boolean;
}

// 创建API密钥响应
export interface ApiKeyCreateResponse {
  id: string;
  api_key: string;
  masked_key: string;
  agent_id: string;
  expires_at: string | null;
  created_at: string;
}

// 旋转API密钥响应
export interface ApiKeyRotateResponse {
  id: string;
  api_key: string;
  masked_key: string;
  expires_at: string | null;
  created_at: string;
}

// 项目统计类型定义
export interface ProjectStatistics {
  project_id: string;
  name: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  in_progress_tasks: number;
  blocked_tasks: number;
  overdue_tasks: number;
  blocking_issues: {
    task_id: string;
    block_reason: string;
    related_tasks: string[];
    blocked_days: number;
  }[];
  member_workload: {
    agent_id: string;
    total_tasks: number;
    completed_tasks: number;
    overdue_tasks: number;
  }[];
  task_trend: {
    date: string;
    tasks_created: number;
    tasks_completed: number;
  }[];
}

// Agent统计
export interface AgentStat {
  agent_id: string;
  agent_name: string;
  agent_type: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  avg_completion_time: number;
  overdue_tasks: number;
}

// 项目统计
export interface ProjectStat {
  project_id: string;
  project_name: string;
  status: string;
  priority: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  in_progress_tasks: number;
  blocked_tasks: number;
  overdue_tasks: number;
  start_date: string;
  end_date: string;
}

// 跨项目统计响应
export interface CrossProjectStats {
  summary: {
    total_projects: number;
    total_tasks: number;
    completed_tasks: number;
    completion_rate: number;
    in_progress_tasks: number;
    blocked_tasks: number;
    overdue_tasks: number;
  };
  agent_stats: AgentStat[];
  project_stats: ProjectStat[];
}

// 审计日志类型定义
export interface AuditLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'query' | 'assign' | 'review';
  resource_type: 'project' | 'task' | 'user' | 'system';
  resource_id: string;
  actor: string;
  actor_type: 'agent' | 'human';
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
  active_projects: number;
  pending_review_tasks: number;
  blocked_tasks: number;
  average_delivery_time: number;
  project_trend: {
    date: string;
    value: number;
  }[];
  agent_workload: {
    name: string;
    type: string;
    tasks: number;
  }[];
  task_status_distribution: {
    status: string;
    count: number;
  }[];
  project_efficiency: {
    project_id: string;
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
  last_login: string;
}

// API响应类型定义
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

// DeadLetterListResponse already has items, code expects list - need to update code to items
