import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Database
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'agentmanage',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Swagger API documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OpenClaw AI Agent Project Management API',
      version: '1.0.0',
      description: 'AI Agent Project Management System API',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Import all models to ensure associations are set up
import './models/AuditLog';
import './models/Deliverable';
import './models/Project';
import './models/ProjectAgent';
import './models/Role';
import './models/Subscription';
import './models/Task';
import './models/User';
import './models/UserRole';

// Auth middleware
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16;
    const v = c === 'x' ? Math.floor(Math.random() * 16) : (Math.floor(Math.random() * 16) | 1);
    return v.toString(16);
  });
}

async function addAuditLog(projectId: string | null, userId: string, action: string, resourceType: string, resourceId: string, content: any, req: any) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (id, project_id, user_id, action, resource_type, resource_id, content, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [generateUUID(), projectId, userId, action, resourceType, resourceId, JSON.stringify(content), req.ip || 'unknown', req.headers['user-agent'] || 'unknown']
    );
  } catch (error) { console.error("Add audit log error:", error); }
}

const authMiddleware = (requiredRoles?: string[]) => {
  return async (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ code: 401, msg: "Authorization header missing", data: null });
      }
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
      req.user = decoded;
      if (requiredRoles && !requiredRoles.includes(decoded.role)) {
        return res.status(403).json({ code: 403, msg: "Insufficient permissions", data: null });
      }
      next();
    } catch (error) {
      return res.status(401).json({ code: 401, msg: "Invalid or expired token", data: null });
    }
  };
};

const checkProjectOwnerOrAdmin = () => {
  return async (req: any, res: any, next: any) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (userRole === 'admin') {
        return next();
      }

      const result = await pool.query(`SELECT manager_id FROM projects WHERE id = $1`, [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ code: 404, msg: "项目不存在", data: null });
      }

      if (result.rows[0].manager_id === userId) {
        return next();
      }

      return res.status(403).json({ code: 403, msg: "只有项目负责人或管理员可以修改", data: null });
    } catch (error) {
      return res.status(500).json({ code: 500, msg: "权限检查失败", data: null });
    }
  };
};

const checkTaskPermission = () => {
  return async (req: any, res: any, next: any) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (userRole === 'admin') {
        return next();
      }

      const result = await pool.query(`SELECT project_id, assignee_id FROM tasks WHERE id = $1`, [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ code: 404, msg: "任务不存在", data: null });
      }

      const projectResult = await pool.query(`SELECT manager_id FROM projects WHERE id = $1`, [result.rows[0].project_id]);
      if (projectResult.rows[0].manager_id === userId || result.rows[0].assignee_id === userId) {
        return next();
      }

      return res.status(403).json({ code: 403, msg: "只有项目负责人或任务负责人可以修改", data: null });
    } catch (error) {
      return res.status(500).json({ code: 500, msg: "权限检查失败", data: null });
    }
  };
};

// Import route routers
import projectsRouter from './routes/projects';
import tasksRouter from './routes/tasks';
import usersRouter from './routes/users';
import rolesRouter from './routes/roles';
import userRolesRouter from './routes/userRoles';
import projectAgentsRouter from './routes/projectAgents';
import deliverablesRouter from './routes/deliverables';
import auditLogsRouter from './routes/auditLogs';
import subscriptionsRouter from './routes/subscriptions';

// Mount routes
app.use("/api/projects", projectsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/users", usersRouter);
app.use("/api/roles", rolesRouter);
app.use("/api/user-roles", userRolesRouter);
app.use("/api/project-agents", projectAgentsRouter);
app.use("/api/deliverables", deliverablesRouter);
app.use("/api/audit-logs", auditLogsRouter);
app.use("/api/subscriptions", subscriptionsRouter);

// Health check
app.get("/health", async (req, res) => {
  res.status(200).json({ code: 0, msg: "OK", data: { status: "healthy", timestamp: new Date().toISOString() } });
});

// Auth routes
app.post("/api/auth/login", async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT id, email, password_hash, name, role, status FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ code: 401, msg: "Invalid email or password", data: null });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ code: 401, msg: "Invalid email or password", data: null });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ code: 401, msg: "Account is inactive", data: null });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    
    const { password_hash, ...userWithoutPassword } = user;
    res.status(200).json({
      code: 0,
      msg: "Login success",
      data: {
        token,
        user: userWithoutPassword,
      },
    });
  } catch (error) { console.error("Login error:", error); res.status(500).json({ code: 500, msg: "Login failed", data: null }); }
});

app.post("/api/auth/register", async (req: any, res: any) => {
  try {
    const { email, password, name, role } = req.body;
    
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ code: 400, msg: "User already exists", data: null });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = generateUUID();
    
    await pool.query(
      'INSERT INTO users (id, email, password_hash, name, role, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())',
      [id, email, passwordHash, name, role || 'viewer', 'active']
    );

    await addAuditLog(null, id, 'create', 'user', id, { email, name, role }, req);

    res.status(201).json({ code: 0, msg: "User created successfully", data: { id, email, name, role } });
  } catch (error) { console.error("Registration error:", error); res.status(500).json({ code: 500, msg: "Registration failed", data: null }); }
});

// Additional routes
import { getTasksByProject, updateTaskStatus, assignTask } from './controllers/tasks';

app.get("/api/tasks-by-project/:projectId", authMiddleware(), getTasksByProject);
app.put("/api/tasks/:id/status", authMiddleware(), checkTaskPermission(), updateTaskStatus);
app.post("/api/tasks/:id/assign", authMiddleware(), checkTaskPermission(), assignTask);

app.get("/api/users/me", authMiddleware(), async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(`SELECT id, email, role, name, created_at FROM users WHERE id = $1`, [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ code: 404, msg: "用户不存在", data: null });
    }
    res.status(200).json({ code: 0, msg: "success", data: result.rows[0] });
  } catch (error) { console.error("Get user info error:", error); res.status(500).json({ code: 500, msg: "获取用户信息失败", data: null }); }
});

app.get("/api/audit-logs", authMiddleware(['admin']), async (req: any, res: any) => {
  try {
    const { project_id, page = 1, pageSize = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);
    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;
    if (project_id) { whereClause += ` AND project_id = $${paramIndex++}`; params.push(project_id); }
    const countResult = await pool.query(`SELECT COUNT(*) as count FROM audit_logs ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);
    const result = await pool.query(
      `SELECT * FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, Number(pageSize), offset]
    );
    res.status(200).json({ code: 0, msg: "success", data: { list: result.rows, total, page: Number(page), pageSize: Number(pageSize) } });
  } catch (error) { console.error("Get audit logs error:", error); res.status(500).json({ code: 500, msg: "查询审计日志失败", data: null }); }
});

app.get("/api/statistics", authMiddleware(), async (req: any, res: any) => {
  try {
    const { project_id } = req.query;
    let whereClause = "";
    const params: any[] = [];
    if (project_id) { whereClause = "WHERE project_id = $1"; params.push(project_id); }
    const taskStats = await pool.query(`SELECT status, COUNT(*) as count FROM tasks ${whereClause} GROUP BY status`, params);
    const projectCount = await pool.query(
      `SELECT COUNT(*) as total FROM projects WHERE is_archived = false ${project_id ? "AND id = $1" : ""}`,
      project_id ? [project_id] : []
    );
    const stats = {
      tasks: taskStats.rows.reduce((acc: any, row: any) => { acc[row.status] = parseInt(row.count); return acc; }, {}),
      totalProjects: parseInt(projectCount.rows[0].total),
      totalTasks: taskStats.rows.reduce((sum: number, row: any) => sum + parseInt(row.count), 0),
    };
    res.status(200).json({ code: 0, msg: "success", data: stats });
  } catch (error) { console.error("Get statistics error:", error); res.status(500).json({ code: 500, msg: "获取统计数据失败", data: null }); }
});

app.all("*", (req, res) => { res.status(404).json({ code: 404, msg: "Not found", data: null }); });
app.use((err: Error, req: any, res: any, next: any) => { console.error(err.stack); res.status(500).json({ code: 500, msg: "Internal server error", data: null }); });

async function startServer() {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    console.log('Database connection successful');

    // Sync models - no alter since we already have the table
    const { default: sequelize } = require('./config/database');
    await sequelize.sync({ alter: false });
    console.log('Models synchronized');

    app.listen(PORT, () => {
      console.log(`🚀 服务启动成功，运行在端口 ${PORT}`);
      console.log(`🔍 健康检查: http://localhost:${PORT}/health`);
      console.log(`📚 API文档: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Server initialization failed:', error);
    process.exit(1);
  }
}

startServer();
