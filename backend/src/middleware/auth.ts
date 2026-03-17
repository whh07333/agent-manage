import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({
        code: 401,
        msg: 'Authorization header required',
        data: null,
        trace_id: req.headers['x-request-id'] || 'default'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        code: 401,
        msg: 'Token required',
        data: null,
        trace_id: req.headers['x-request-id'] || 'default'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    res.status(401).json({
      code: 401,
      msg: 'Invalid or expired token',
      data: null,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  }
};

export const adminMiddleware = (req: any, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      code: 403,
      msg: 'Access denied. Admin role required',
      data: null,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  }

  next();
};
