import axios, { AxiosError } from 'axios';
import type { ApiResponse } from '../types';

// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// 开发环境默认 token - 从环境变量读取
const DEFAULT_TOKEN = import.meta.env.VITE_DEFAULT_TOKEN || '';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 直接使用环境变量中的默认 token，不需要从 localStorage 读取
    if (DEFAULT_TOKEN) {
      config.headers.Authorization = `Bearer ${DEFAULT_TOKEN}`;
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
  
  // 删除项目
  deleteProject: (id: string) => request<any>({
    url: `/api/projects/${id}`,
    method: 'DELETE',
  }),
};

export default apiClient;
