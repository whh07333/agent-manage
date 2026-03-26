import axios from 'axios';
import type { ApiResponse, Project } from '../types';

// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// 🔑 开发环境默认 token - 从环境变量读取，如果环境变量为空则使用 localStorage 中的 token
const DEFAULT_TOKEN = import.meta.env.VITE_DEFAULT_TOKEN || '';

// JWT token 解析和验证工具函数
const parseJwt = (token: string): any | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

const isTokenValid = (token: string): boolean => {
  const payload = parseJwt(token);
  if (!payload) return false; // 无效的 JWT 格式
  if (!payload.exp) return true; // 没有过期时间，视为永久有效
  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now;
};

const isTokenExpiringSoon = (token: string, thresholdDays: number = 1): boolean => {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return false; // 没有过期时间，不会即将过期
  const now = Math.floor(Date.now() / 1000);
  const thresholdSeconds = thresholdDays * 24 * 60 * 60;
  return payload.exp - now <= thresholdSeconds;
};

// 获取最优 token
const getOptimalToken = (): string | null => {
  const envToken = import.meta.env.VITE_DEFAULT_TOKEN || '';
  const localToken = localStorage.getItem('token');

  // 优先使用环境变量中的 token（开发环境固定 token）
  if (envToken && isTokenValid(envToken)) {
    return envToken;
  }

  // 其次使用 localStorage 中的 token，但需要检查有效性
  if (localToken && isTokenValid(localToken)) {
    // 检查是否即将过期
    if (isTokenExpiringSoon(localToken)) {
      // token 即将过期，使用环境变量 token 替换（如果环境变量 token 有效）
      if (envToken && isTokenValid(envToken)) {
        localStorage.setItem('token', envToken);
        return envToken;
      }
    }
    return localToken;
  }

  // 如果 localStorage token 过期，使用环境变量 token（即使可能也过期，但作为后备）
  if (envToken) {
    // 更新 localStorage 以便后续使用
    localStorage.setItem('token', envToken);
    return envToken;
  }

  // 没有任何可用 token
  return null;
};

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 🔑 使用最优 token 逻辑（优先环境变量，检查过期，自动刷新）
    const token = getOptimalToken();
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
  
  // 创建项目
  createProject: (projectData: any) => request<Project>({
    url: '/api/projects',
    method: 'POST',
    data: projectData,
  }),
  
  // 获取项目详情
  getProjectById: (id: string) => request<Project>({
    url: `/api/projects/${id}`,
    method: 'GET',
  }),
  
  // 更新项目
  updateProject: (id: string, projectData: any) => request<Project>({
    url: `/api/projects/${id}`,
    method: 'PUT',
    data: projectData,
  }),

  // 归档项目
  archiveProject: (id: string) => request<Project>({
    url: `/api/projects/${id}/archive`,
    method: 'POST',
  }),

  // 删除项目
  deleteProject: (id: string) => request<any>({
    url: `/api/projects/${id}`,
    method: 'DELETE',
  }),
};

// 统计数据API
export const statisticsApi = {
  getStatistics: () => request<any>({
    url: '/api/statistics',
    method: 'GET',
  }),

  getRealTimeStatistics: () => request<any>({
    url: '/api/statistics/realtime',
    method: 'GET',
  }),
};

// 任务管理API
export const taskApi = {
  getTasks: () => request<any[]>({
    url: '/api/tasks',
    method: 'GET',
  }),
  
  getTaskById: (id: string) => request<any>({
    url: `/api/tasks/${id}`,
    method: 'GET',
  }),
  
  createTask: (taskData: any) => request<any>({
    url: '/api/tasks',
    method: 'POST',
    data: taskData,
  }),
  
  updateTask: (id: string, taskData: any) => request<any>({
    url: `/api/tasks/${id}`,
    method: 'PUT',
    data: taskData,
  }),
  
  deleteTask: (id: string) => request<any>({
    url: `/api/tasks/${id}`,
    method: 'DELETE',
  }),
};

// 审计日志API
export const auditLogApi = {
  getAuditLogs: () => request<any[]>({
    url: '/api/audit-logs',
    method: 'GET',
  }),
};

// 死信管理API
export const deadLetterApi = {
  getDeadLetters: () => request<any[]>({
    url: '/api/dead-letters',
    method: 'GET',
  }),
};

// Agent API Key管理API
export const apiKeyApi = {
  getApiKeys: () => request<any[]>({
    url: '/api/agent-keys',
    method: 'GET',
  }),
  
  createApiKey: (keyData: any) => request<any>({
    url: '/api/agent-keys',
    method: 'POST',
    data: keyData,
  }),
  
  deleteApiKey: (id: string) => request<any>({
    url: `/api/agent-keys/${id}`,
    method: 'DELETE',
  }),
};

export default apiClient;
