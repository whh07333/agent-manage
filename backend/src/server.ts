import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Pool } from 'pg';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { authMiddleware } from './middleware/auth';

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
  credentials: true
}));

// Swagger/OpenAPI configuration
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AgentManage API',
      version: '2.0.0',
      description: 'OpenClaw AI Agent Project Management System - Iteration 2 API',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'agentmanage',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Import routes
import projectsRouter from './routes/projects';
import tasksRouter from './routes/tasks';
import usersRouter from './routes/users';
import rolesRouter from './routes/roles';
import userRolesRouter from './routes/userRoles';
import projectAgentsRouter from './routes/projectAgents';
import deliverablesRouter from './routes/deliverables';
import auditLogsRouter from './routes/auditLogs';
import subscriptionsRouter from './routes/subscriptions';
import apiKeysRouter from './routes/apiKeys';
import statisticsRouter from './routes/statistics';

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
app.use("/api/api-keys", apiKeysRouter);
app.use("/api/statistics", statisticsRouter);

// Health check
app.get("/health", async (req, res) => {
  res.status(200).json({ code: 0, msg: "OK", data: { status: "healthy", timestamp: new Date().toISOString() } });
});

// Statistics endpoint for real-time monitoring
app.get("/api/statistics/real-time", authMiddleware, async (req: any, res: any) => {
  try {
    // Get basic connection stats
    const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM projects WHERE deleted_at IS NULL) as total_projects,
        (SELECT COUNT(*) FROM tasks WHERE deleted_at IS NULL) as total_tasks,
        (SELECT COUNT(*) FROM subscriptions WHERE is_active = true) as active_subscriptions,
        (SELECT COUNT(*) FROM dead_letter_events WHERE retried = false) as pending_dead_letters
    `);
    
    const stats = result.rows[0];
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
