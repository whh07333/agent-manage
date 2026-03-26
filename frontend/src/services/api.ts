import axios from 'axios';
import type { ApiResponse, Project } from '../types';

// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// 🔑 开发环境默认 token - 从环境变量读取，如果环境变量为空则使用 localStorage 中的 token
const DEFAULT_TOKEN = import.meta.env.VITE_DEFAULT_TOKEN || '';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 🔑 优先使用环境变量中的默认 token，如果环境变量为空则使用 localStorage 中的 token
    let token: string | null = DEFAULT_TOKEN;
    if (!token) {
      token = localStorage.getItem('token');
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
