import { Response } from 'express';

// 成功响应处理
export const handleSuccess = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any
) => {
  res.status(statusCode).json({
    code: 0,
    msg: message,
    data: data || null,
    trace_id: res.locals.traceId || generateTraceId(),
    timestamp: new Date().toISOString()
  });
};

// 错误响应处理
export const handleError = (
  res: Response,
  error: Error | string | any
) => {
  const errorMessage = error.message || error.toString();
  const statusCode = error.statusCode || 500;
  
  res.status(statusCode).json({
    code: error.code || statusCode,
    msg: errorMessage,
    data: null,
    trace_id: res.locals.traceId || generateTraceId(),
    timestamp: new Date().toISOString()
  });
};

// 生成追踪ID
const generateTraceId = () => {
  return `req-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};
