import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * HTTP日志中间件
 * 记录所有HTTP请求和响应的详细信息
 */
export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string ||
                   req.headers['x-correlation-id'] as string ||
                   `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // 将requestId添加到请求对象和响应头
  (req as any).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  // 记录请求信息
  logger.info('HTTP Request', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length'],
    query: req.query,
    body: sanitizeBody(req.body)
  });

  // 重写res.json方法以记录响应信息
  const originalJson = res.json;
  res.json = function(body: any) {
    const responseTime = Date.now() - startTime;

    // 记录响应信息
    logger.info('HTTP Response', {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      responseSize: JSON.stringify(body)?.length || 0
    });

    // 调用原始方法
    return originalJson.call(this, body);
  };

  // 监听finish事件以记录请求完成
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const logData = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    };

    // 根据状态码记录不同级别的日志
    if (res.statusCode >= 500) {
      logger.error(`HTTP ${req.method} ${req.originalUrl} ${res.statusCode}`, undefined, logData);
    } else if (res.statusCode >= 400) {
      logger.warn(`HTTP ${req.method} ${req.originalUrl} ${res.statusCode}`, logData);
    } else {
      logger.debug(`HTTP ${req.method} ${req.originalUrl} ${res.statusCode}`, logData);
    }
  });

  next();
};

/**
 * 清理请求体中的敏感信息
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = ['password', 'token', 'secret', 'authorization', 'creditCard', 'ssn', 'cvv'];
  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (sanitized[field] !== undefined) {
      sanitized[field] = '***REDACTED***';
    }
  }

  // 递归处理嵌套对象
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeBody(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * 错误日志中间件
 * 捕获并记录未处理的错误
 */
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const requestId = (req as any).requestId || 'unknown';

  logger.error(`Unhandled error in ${req.method} ${req.originalUrl}`, err, {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userId: (req as any).user?.id,
    stack: err.stack
  });

  next(err);
};