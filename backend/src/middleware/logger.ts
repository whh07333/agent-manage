import { Request, Response, NextFunction } from "express";

export interface LogContext {
  requestId?: string;
  [key: string]: any;
}

export const logger = {
  info: (message: string, context: LogContext = {}) => {
    const timestamp = new Date().toISOString();
    console.log(
      JSON.stringify({
        level: "info",
        timestamp,
        message,
        ...context,
      }),
    );
  },

  error: (message: string, error: Error, context: LogContext = {}) => {
    const timestamp = new Date().toISOString();
    console.error(
      JSON.stringify({
        level: "error",
        timestamp,
        message,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        ...context,
      }),
    );
  },

  warn: (message: string, context: LogContext = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(
      JSON.stringify({
        level: "warn",
        timestamp,
        message,
        ...context,
      }),
    );
  },
};

export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers["x-request-id"] as string) || "default";
  logger.info(`${req.method} ${req.path}`, { requestId });
  next();
};

export const errorLogger = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId = (req.headers["x-request-id"] as string) || "default";
  logger.error("Unhandled error", err, { requestId });
  res.status(500).json({
    code: 500,
    msg: "Internal server error",
    data: null,
    trace_id: requestId,
    timestamp: new Date().toISOString(),
  });
};
