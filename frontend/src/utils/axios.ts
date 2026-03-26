import axios from 'axios';
import { message } from 'antd';

// 创建axios实例
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 🔑 优先使用环境变量中的token（最稳定）
    let token: string | undefined = import.meta.env.VITE_DEFAULT_TOKEN;
    
    // 如果环境变量没有token，尝试从localStorage获取（兼容性）
    if (!token) {
      token = localStorage.getItem('token');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 对响应数据做些什么
    const { code, msg, data } = response.data;
    if (code !== 0) {
      message.error(msg || '请求失败');
      return Promise.reject(new Error(msg || '请求失败'));
    }
    return data;
  },
  (error) => {
    // 对响应错误做些什么
    const { response } = error;
    if (response) {
      // 处理不同的错误状态码
      switch (response.status) {
        case 401:
          message.error('登录已过期，请重新登录');
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          message.error('没有权限访问');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器内部错误');
          break;
        default:
          message.error(response.data.msg || '请求失败');
      }
    } else {
      message.error('网络错误，请检查网络连接');
    }
    return Promise.reject(error);
  }
);

export default instance;
