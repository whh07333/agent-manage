import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import sequelize from './config/database';
import { httpLogger, errorLogger } from './middleware/logger';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import userRoutes from './routes/users';
import subscriptionRoutes from './routes/subscriptions';
import auditLogRoutes from './routes/auditLogs';
import deliverableRoutes from './routes/deliverables';
import roleRoutes from './routes/roles';
import userRoleRoutes from './routes/userRoles';
import projectAgentRoutes from './routes/projectAgents';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(httpLogger); // HTTP请求日志
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/audit-logs', auditLogRoutes);
app.use('/api/v1/deliverables', deliverableRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/user-roles', userRoleRoutes);
app.use('/api/v1/project-agents', projectAgentRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 错误日志中间件 - 记录错误但不处理
app.use(errorLogger);

// 全局错误处理器
app.use((err: any, req: any, res: any, next: any) => {
  const statusCode = err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    code: statusCode,
    msg: isProduction && statusCode === 500 ? 'Internal server error' : err.message,
    data: null,
    trace_id: req.headers['x-request-id'] || (req as any).requestId || 'unknown',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start Server
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful');
    
    await sequelize.sync({ force: process.env.NODE_ENV === 'development' });
    console.log('Database synchronized');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Server initialization failed:', error);
    process.exit(1);
  }
};

startServer();
