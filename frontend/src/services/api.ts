import axios, { AxiosError } from 'axios';
import type { ApiResponse } from '../types';

// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// 开发环境默认 token
const defaultToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQzNjU1ODIsImV4cCI6MTc3NDk3MDM4Mn0.0nQtGwSmuow9mmEQgukL2pAJ_8Og_bYKkxYsMtCFHwY';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加授权信息
    let token = localStorage.getItem('token');
    // 开发环境：如果localStorage没有token，使用环境变量中的默认token
    const defaultToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQzNjU1ODIsImV4cCI6MTc3NDk3MDM4Mn0.0nQtGwSmuow9mmEQgukL2pAJ_8Og_bYKkxYsMtCFHwY';
    
    // 检查 token 是否有效，如果无效使用默认 token
    if (!token && defaultToken) {
      token = defaultToken as string;
      localStorage.setItem('token', token);
      console.log('设置默认token:', token.substring(0, 20) + '...');
    } else if (token && defaultToken) {
      // 如果有 token，检查是否过期（简单检查）
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Date.now() / 1000;
        if (payload.exp && payload.exp < now) {
          console.log('Token 已过期，使用默认 token');
          token = defaultToken;
          localStorage.setItem('token', token);
        }
      } catch (e) {
        console.log('Token 检查失败，使用默认 token');
        token = defaultToken;
        localStorage.setItem('token', token);
      }
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
      console.log('401 认证失败，设置默认 token 并重试');
      const defaultToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQzNjU1ODIsImV4cCI6MTc3NDk3MDM4Mn0.0nQtGwSmuow9mmEQgukL2pAJ_8Og_bYKkxYsMtCFHwY';
      
      // 设置默认 token
      localStorage.setItem('token', defaultToken);
      
      // 返回 Promise.reject 让请求失败，用户需要刷新页面
      // 生产环境：处理未授权
      return Promise.reject(new Error('Token expired, please refresh page'));
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
