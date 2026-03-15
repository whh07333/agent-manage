import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authMiddleware = (requiredRoles?: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          code: 401,
          msg: "Authorization header missing",
          data: null,
        });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
      req.user = decoded;

      if (requiredRoles && !requiredRoles.includes(decoded.role)) {
        return res.status(403).json({
          code: 403,
          msg: "Insufficient permissions",
          data: null,
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        code: 401,
        msg: "Invalid or expired token",
        data: null,
      });
    }
  };
};
