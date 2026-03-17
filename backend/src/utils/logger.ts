import { AuditLog } from '../models/AuditLog';
import { Request } from 'express';

/**
 * 日志级别枚举
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * 审计日志接口
 */
export interface AuditLogData {
  actorId: string;
  actorType: 'agent' | 'human';
  action: string;
  targetType: string;
  targetId?: string;
  parameters?: Record<string, any>;
  result?: 'success' | 'failed' | 'pending';
  errorMessage?: string;
}

/**
 * 应用日志接口
 */
export interface AppLogData {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp?: Date;
}

/**
 * 日志服务类
 * 提供统一的日志记录功能，包括审计日志和应用日志
 */
export class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;
  private serviceName: string;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.serviceName = process.env.SERVICE_NAME || 'agent-manage-backend';
  }

  /**
   * 获取Logger单例实例
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * 记录审计日志到数据库
   */
  public async audit(logData: AuditLogData): Promise<void> {
    try {
      await AuditLog.create({
        actor_id: logData.actorId,
        actor_type: logData.actorType,
        action: logData.action,
        target_type: logData.targetType,
        target_id: logData.targetId,
        parameters: logData.parameters,
        result: logData.result || 'success',
        error_message: logData.errorMessage
      });

      // 开发环境同时输出到控制台
      if (this.isDevelopment) {
        console.log(`[AUDIT] ${logData.action} - ${logData.targetType}${logData.targetId ? `:${logData.targetId}` : ''} - ${logData.result || 'success'}`);
      }
    } catch (error) {
      // 审计日志记录失败时，降级到控制台输出
      console.error('[LOGGER ERROR] Failed to save audit log:', error);
      console.error('[AUDIT FALLBACK]', logData);
    }
  }

  /**
   * 记录应用日志（控制台+文件，根据环境配置）
   */
  public log(logData: AppLogData): void {
    const timestamp = logData.timestamp || new Date();
    const logEntry = {
      timestamp: timestamp.toISOString(),
      level: logData.level,
      service: this.serviceName,
      message: logData.message,
      context: logData.context || {}
    };

    // 根据日志级别输出到控制台
    switch (logData.level) {
      case LogLevel.ERROR:
        console.error(JSON.stringify(logEntry));
        break;
      case LogLevel.WARN:
        console.warn(JSON.stringify(logEntry));
        break;
      case LogLevel.INFO:
        console.info(JSON.stringify(logEntry));
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(JSON.stringify(logEntry));
        }
        break;
    }

    // TODO: 生产环境下可以集成到ELK、Sentry等系统
    // 这里可以根据环境变量配置日志输出到文件或外部服务
  }

  /**
   * 快捷方法：记录信息日志
   */
  public info(message: string, context?: Record<string, any>): void {
    this.log({
      level: LogLevel.INFO,
      message,
      context,
      timestamp: new Date()
    });
  }

  /**
   * 快捷方法：记录错误日志
   */
  public error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log({
      level: LogLevel.ERROR,
      message,
      context: {
        ...context,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : undefined
      },
      timestamp: new Date()
    });
  }

  /**
   * 快捷方法：记录警告日志
   */
  public warn(message: string, context?: Record<string, any>): void {
    this.log({
      level: LogLevel.WARN,
      message,
      context,
      timestamp: new Date()
    });
  }

  /**
   * 快捷方法：记录调试日志
   */
  public debug(message: string, context?: Record<string, any>): void {
    this.log({
      level: LogLevel.DEBUG,
      message,
      context,
      timestamp: new Date()
    });
  }

  /**
   * 从Express请求创建审计日志数据
   */
  public createAuditDataFromRequest(
    req: Request,
    action: string,
    targetType: string,
    targetId?: string,
    parameters?: Record<string, any>
  ): AuditLogData {
    const user = (req as any).user;
    return {
      actorId: user?.id || 'system',
      actorType: user?.id ? 'human' : 'agent',
      action,
      targetType,
      targetId,
      parameters
    };
  }
}

// 导出默认实例
export const logger = Logger.getInstance();