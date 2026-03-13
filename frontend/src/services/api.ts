import axios from 'axios';
import { ApiResponse } from '../types';

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
    const token = localStorage.getItem('token');
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
      data: null,
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
  createProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => request<Project>({
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
  deleteProject: (id: string) => request<void>({
    url: `/api/projects/${id}`,
    method: 'DELETE',
  }),
  // 归档项目
  archiveProject: (id: string) => request<void>({
    url: `/api/projects/${id}/archive`,
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
  createTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => request<Task>({
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
  deleteTask: (id: string) => request<void>({
    url: `/api/tasks/${id}`,
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
};

// 用户API
export const userApi = {
  // 获取用户列表
  getUsers: () => request<User[]>({
    url: '/api/users',
    method: 'GET',
  }),
};

export default apiClient;
