import axios from 'axios';
import type { ApiResponse } from '../types';
import type { Project } from '../types';
import type { Task } from '../types';
import type { AuditLog } from '../types';
import type { Statistics } from '../types';
import type { User } from '../types';
import type { ProjectStatistics, CrossProjectStats } from '../types';
import type { DeadLetterListResponse } from '../types';
import type { ApiKey, ApiKeyCreateResponse, ApiKeyRotateResponse } from '../types';

// 创建axios实例
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加授权信息
    let token = localStorage.getItem('token');
    // 如果localStorage没有token，使用环境变量中的默认token（开发环境）
    const defaultToken = import.meta.env.VITE_DEFAULT_TOKEN;
    if (!token && defaultToken) {
      token = defaultToken as string;
      localStorage.setItem('token', token);
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 统一错误处理
    if (error.response?.status === 401) {
      // 处理未授权
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 通用请求方法
const request = async <T>(config: any): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error: any) {
    return {
      code: error.response?.status || 500,
      msg: error.response?.data?.msg || error.message,
      data: null as unknown as T,
    };
  }
};

// 项目管理API
export const projectApi = {
  // 获取项目列表
  getProjects: () => request<Project[]>({
    url: '/api/projects',
    method: 'GET',
  }),
  // 获取项目详情
  getProject: (id: string) => request<Project>({
    url: `/api/projects/${id}`,
    method: 'GET',
  }),
  // 创建项目
  createProject: (data: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => request<Project>({
    url: '/api/projects',
    method: 'POST',
    data,
  }),
  // 更新项目
  updateProject: (id: string, data: Partial<Project>) => request<Project>({
    url: `/api/projects/${id}`,
    method: 'PUT',
    data,
  }),
  // 删除项目
  deleteProject: (_id: string) => request<void>({
    url: `/api/projects/${_id}`,
    method: 'DELETE',
  }),
  // 归档项目
  archiveProject: (_id: string) => request<void>({
    url: `/api/projects/${_id}/archive`,
    method: 'POST',
  }),
};

// 任务管理API
export const taskApi = {
  // 获取任务列表
  getTasks: () => request<Task[]>({
    url: '/api/tasks',
    method: 'GET',
  }),
  // 获取任务详情
  getTask: (id: string) => request<Task>({
    url: `/api/tasks/${id}`,
    method: 'GET',
  }),
  // 创建任务
  createTask: (data: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => request<Task>({
    url: '/api/tasks',
    method: 'POST',
    data,
  }),
  // 更新任务
  updateTask: (id: string, data: Partial<Task>) => request<Task>({
    url: `/api/tasks/${id}`,
    method: 'PUT',
    data,
  }),
  // 删除任务
  deleteTask: (_id: string) => request<void>({
    url: `/api/tasks/${_id}`,
    method: 'DELETE',
  }),
  // 更新任务状态
  updateTaskStatus: (id: string, status: Task['status']) => request<Task>({
    url: `/api/tasks/${id}/status`,
    method: 'PATCH',
    data: { status },
  }),
  // 分配任务
  assignTask: (id: string, assignee: string) => request<Task>({
    url: `/api/tasks/${id}/assign`,
    method: 'PATCH',
    data: { assignee },
  }),
};

// 审计日志API
export const auditLogApi = {
  // 获取审计日志
  getAuditLogs: () => request<AuditLog[]>({
    url: '/api/audit-logs',
    method: 'GET',
  }),
};

// 统计API
export const statisticsApi = {
  // 获取统计数据
  getStatistics: () => request<Statistics>({
    url: '/api/statistics',
    method: 'GET',
  }),
  // 获取项目概览统计
  getProjectOverview: (projectId: string) => request<ProjectStatistics>({
    url: `/api/statistics/projects/${projectId}/overview`,
    method: 'GET',
  }),
  // 获取跨项目统计
  getCrossProjectStats: (params?: {
    start_date?: string;
    end_date?: string;
    project_ids?: string[];
    agent_ids?: string[];
  }) => request<CrossProjectStats>({
    url: '/api/statistics/cross-project',
    method: 'GET',
    params,
  }),
};

// 用户API
export const userApi = {
  // 获取用户列表
  getUsers: () => request<User[]>({
    url: '/api/users',
    method: 'GET',
  }),
};

// 死信队列API
export const deadLetterApi = {
  // 获取死信列表
  getDeadLetters: (params?: { page?: number; page_size?: number }) =>
    request<DeadLetterListResponse>({
      url: '/api/subscriptions/dead-letters',
      method: 'GET',
      params,
    }),

  // 重发单个死信事件
  retryDeadLetter: (id: string) =>
    request<null>({
      url: `/api/subscriptions/dead-letters/${id}/retry`,
      method: 'POST',
    }),

  // 批量重发所有死信事件
  retryAllDeadLetters: () =>
    request<{ retried: number }>({
      url: '/api/subscriptions/dead-letters/retry-all',
      method: 'POST',
    }),

  // 删除死信事件
  deleteDeadLetter: (id: string) =>
    request<null>({
      url: `/api/subscriptions/dead-letters/${id}`,
      method: 'DELETE',
    }),
};

// API密钥管理API
export const apiKeyApi = {
  // 获取Agent的API密钥列表
  listApiKeys: (agentId: string) =>
    request<ApiKey[]>({
      url: `/api/api-keys/agent/${agentId}`,
      method: 'GET',
    }),

  // 创建API密钥
  createApiKey: (agentId: string, expiresInDays?: number) =>
    request<ApiKeyCreateResponse>({
      url: '/api/api-keys',
      method: 'POST',
      data: {
        agent_id: agentId,
        expires_in_days: expiresInDays,
      },
    }),

  // 撤销API密钥
  revokeApiKey: (id: string) =>
    request<null>({
      url: `/api/api-keys/${id}/revoke`,
      method: 'POST',
    }),

  // 旋转API密钥
  rotateApiKey: (id: string, expiresInDays?: number) =>
    request<ApiKeyRotateResponse>({
      url: `/api/api-keys/${id}/rotate`,
      method: 'POST',
      data: expiresInDays !== undefined ? { expires_in_days: expiresInDays } : {},
    }),
};

export default apiClient;
