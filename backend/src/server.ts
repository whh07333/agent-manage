import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import { EventEmitter } from "events";
import axios from "axios";

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const eventEmitter = new EventEmitter();

// 数据库连接
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "agentmanage",
  password: process.env.DB_PASSWORD || "",
  port: parseInt(process.env.DB_PORT || "5432"),
});

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 认证中间件
const authMiddleware = (requiredRoles?: string[]) => {
  return async (req: any, res: any, next: any) => {
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

// 审计日志中间件
const auditLog = (action: string, resourceType: string) => {
  return async (req: any, res: any, next: any) => {
    try {
      await next();
      if (res.statusCode < 400) {
        const resourceId = req.params.id || req.body.id;
        if (resourceId) {
          await pool.query(
            `INSERT INTO audit_logs (project_id, user_id, action, resource_type, resource_id, content, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              req.body.project_id || req.query.project_id,
              req.user?.id,
              action,
              resourceType,
              resourceId,
              JSON.stringify(req.body),
              req.ip,
              req.get("User-Agent"),
            ]
          );
        }
      }
    } catch (error) {
      console.error("Audit log error:", error);
    }
  };
};

// 事件推送函数
async function pushEvent(eventType: string, projectId: string | null, data: any) {
  try {
    const event = {
      id: Date.now().toString(),
      event_type: eventType,
      project_id: projectId,
      data,
      timestamp: new Date().toISOString(),
    };

    eventEmitter.emit(eventType, event);
    if (projectId) {
      eventEmitter.emit(`${eventType}:${projectId}`, event);
    }

    // 查询订阅者
    const result = await pool.query(
      `SELECT * FROM subscriptions WHERE is_active = true AND (project_id = $1 OR project_id IS NULL)`,
      [projectId]
    );

    // 推送事件
    for (const sub of result.rows) {
      if (sub.event_types.includes("*") || sub.event_types.includes(eventType)) {
        try {
          const signature = sub.secret
            ? require("crypto")
                .createHmac("sha256", sub.secret)
                .update(JSON.stringify(event))
                .digest("hex")
            : undefined;

          await axios.post(sub.callback_url, event, {
            headers: {
              "X-Event-Signature": signature,
              "X-Event-Type": eventType,
              "X-Event-Id": event.id,
            },
            timeout: 5000,
          });

          await pool.query(
            `UPDATE subscriptions SET last_triggered_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [sub.id]
          );
        } catch (error) {
          console.error(`Push event to ${sub.callback_url} failed:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Push event error:", error);
  }
}

// ==========================================
// 健康检查
// ==========================================
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      code: 0,
      msg: "success",
      data: {
        status: "ok",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        database: "connected",
      },
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: "service unavailable",
      data: { status: "error", database: "disconnected" },
    });
  }
});

// ==========================================
// 项目管理API (US001, US004)
// ==========================================

// 创建项目
app.post(
  "/api/projects",
  authMiddleware(),
  auditLog("create_project", "project"),
  async (req: any, res) => {
    try {
      const { name, description, manager_id, priority, due_date, agents } = req.body;

      if (!name || !manager_id) {
        return res.status(400).json({
          code: 4001,
          msg: "项目名称和负责人ID不能为空",
          data: null,
        });
      }

      const result = await pool.query(
        `INSERT INTO projects (name, description, manager_id, priority, due_date)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [name, description, manager_id, priority || "medium", due_date]
      );

      const project = result.rows[0];

      // 添加项目成员
      if (agents && Array.isArray(agents)) {
        for (const agentId of agents) {
          await pool.query(
            `INSERT INTO project_agents (project_id, agent_id, role) VALUES ($1, $2, 'member')
             ON CONFLICT (project_id, agent_id) DO NOTHING`,
            [project.id, agentId]
          );
        }
      }

      // 触发事件
      await pushEvent("project.created", project.id, project);

      res.status(201).json({ code: 0, msg: "项目创建成功", data: project });
    } catch (error) {
      console.error("Create project error:", error);
      res.status(500).json({ code: 500, msg: "创建项目失败", data: null });
    }
  }
);

// 查询项目列表
app.get("/api/projects", authMiddleware(), async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status, priority } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = "WHERE is_archived = false";
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      whereClause += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    if (priority) {
      whereClause += ` AND priority = $${paramIndex++}`;
      params.push(priority);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM projects ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT * FROM projects ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, Number(pageSize), offset]
    );

    // 查询每个项目的任务统计
    const projects = [];
    for (const project of result.rows) {
      const taskResult = await pool.query(
        `SELECT status, COUNT(*) as count FROM tasks WHERE project_id = $1 GROUP BY status`,
        [project.id]
      );
      const taskStats = taskResult.rows.reduce((acc: any, row: any) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {});

      projects.push({
        ...project,
        task_stats: {
          total: Object.values(taskStats).reduce((a: number, b: unknown) => a + (b as number), 0),
          completed: taskStats.completed || 0,
          in_progress: taskStats.in_progress || 0,
          pending: taskStats.pending || 0,
          blocked: taskStats.blocked || 0,
        },
      });
    }

    res.status(200).json({
      code: 0,
      msg: "success",
      data: {
        list: projects,
        total,
        page: Number(page),
        pageSize: Number(pageSize),
      },
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ code: 500, msg: "查询项目列表失败", data: null });
  }
});

// 查询项目详情
app.get("/api/projects/:id", authMiddleware(), async (req, res) => {
  try {
    const { id } = req.params;

    const projectResult = await pool.query(`SELECT * FROM projects WHERE id = $1`, [id]);
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ code: 404, msg: "项目不存在", data: null });
    }

    const project = projectResult.rows[0];

    // 查询任务列表
    const tasksResult = await pool.query(
      `SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    // 查询项目成员
    const agentsResult = await pool.query(
      `SELECT * FROM project_agents WHERE project_id = $1`,
      [id]
    );

    res.status(200).json({
      code: 0,
      msg: "success",
      data: {
        ...project,
        tasks: tasksResult.rows,
        agents: agentsResult.rows,
      },
    });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({ code: 500, msg: "查询项目详情失败", data: null });
  }
});

// 更新项目
app.put(
  "/api/projects/:id",
  authMiddleware(),
  auditLog("update_project", "project"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, priority, status, due_date, is_archived } = req.body;

      const projectResult = await pool.query(`SELECT * FROM projects WHERE id = $1`, [id]);
      if (projectResult.rows.length === 0) {
        return res.status(404).json({ code: 404, msg: "项目不存在", data: null });
      }

      const result = await pool.query(
        `UPDATE projects SET 
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          priority = COALESCE($3, priority),
          status = COALESCE($4, status),
          due_date = COALESCE($5, due_date),
          is_archived = COALESCE($6, is_archived),
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $7 RETURNING *`,
        [name, description, priority, status, due_date, is_archived, id]
      );

      const updatedProject = result.rows[0];
      await pushEvent("project.updated", id, updatedProject);

      res.status(200).json({ code: 0, msg: "项目更新成功", data: updatedProject });
    } catch (error) {
      console.error("Update project error:", error);
      res.status(500).json({ code: 500, msg: "更新项目失败", data: null });
    }
  }
);

// 归档项目
app.delete(
  "/api/projects/:id",
  authMiddleware(),
  auditLog("archive_project", "project"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const projectResult = await pool.query(`SELECT * FROM projects WHERE id = $1`, [id]);
      if (projectResult.rows.length === 0) {
        return res.status(404).json({ code: 404, msg: "项目不存在", data: null });
      }

      await pool.query(
        `UPDATE projects SET is_archived = true, status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [id]
      );

      await pushEvent("project.archived", id, { id });

      res.status(200).json({ code: 0, msg: "项目归档成功", data: null });
    } catch (error) {
      console.error("Archive project error:", error);
      res.status(500).json({ code: 500, msg: "归档项目失败", data: null });
    }
  }
);

// ==========================================
// 任务管理API (US005, US006, US007)
// ==========================================

// 创建任务
app.post(
  "/api/tasks",
  authMiddleware(),
  auditLog("create_task", "task"),
  async (req, res) => {
    try {
      const { name, description, project_id, assignee_id, priority, due_date, parent_id, dependencies } = req.body;

      if (!name || !project_id) {
        return res.status(400).json({
          code: 4001,
          msg: "任务名称和项目ID不能为空",
          data: null,
        });
      }

      // 检查项目是否存在
      const projectResult = await pool.query(`SELECT id FROM projects WHERE id = $1`, [project_id]);
      if (projectResult.rows.length === 0) {
        return res.status(400).json({ code: 4002, msg: "所属项目不存在", data: null });
      }

      const result = await pool.query(
        `INSERT INTO tasks (name, description, project_id, assignee_id, priority, due_date, parent_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, description, project_id, assignee_id, priority || "medium", due_date, parent_id]
      );

      const task = result.rows[0];
      await pushEvent("task.created", project_id, task);

      res.status(201).json({ code: 0, msg: "任务创建成功", data: task });
    } catch (error) {
      console.error("Create task error:", error);
      res.status(500).json({ code: 500, msg: "创建任务失败", data: null });
    }
  }
);

// 查询任务列表
app.get("/api/tasks", authMiddleware(), async (req, res) => {
  try {
    const { page = 1, pageSize = 10, project_id, status, priority, assignee_id } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (project_id) {
      whereClause += ` AND project_id = $${paramIndex++}`;
      params.push(project_id);
    }
    if (status) {
      whereClause += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    if (priority) {
      whereClause += ` AND priority = $${paramIndex++}`;
      params.push(priority);
    }
    if (assignee_id) {
      whereClause += ` AND assignee_id = $${paramIndex++}`;
      params.push(assignee_id);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM tasks ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT t.*, p.name as project_name 
       FROM tasks t 
       LEFT JOIN projects p ON t.project_id = p.id 
       ${whereClause} 
       ORDER BY t.created_at DESC 
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, Number(pageSize), offset]
    );

    res.status(200).json({
      code: 0,
      msg: "success",
      data: {
        list: result.rows,
        total,
        page: Number(page),
        pageSize: Number(pageSize),
      },
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ code: 500, msg: "查询任务列表失败", data: null });
  }
});

// 查询任务详情
app.get("/api/tasks/:id", authMiddleware(), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT t.*, p.name as project_name 
       FROM tasks t 
       LEFT JOIN projects p ON t.project_id = p.id 
       WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ code: 404, msg: "任务不存在", data: null });
    }

    res.status(200).json({ code: 0, msg: "success", data: result.rows[0] });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({ code: 500, msg: "查询任务详情失败", data: null });
  }
});

// 更新任务
app.put(
  "/api/tasks/:id",
  authMiddleware(),
  auditLog("update_task", "task"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, assignee_id, priority, due_date, status, status_remark } = req.body;

      const taskResult = await pool.query(`SELECT * FROM tasks WHERE id = $1`, [id]);
      if (taskResult.rows.length === 0) {
        return res.status(404).json({ code: 404, msg: "任务不存在", data: null });
      }
      const task = taskResult.rows[0];

      const result = await pool.query(
        `UPDATE tasks SET 
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          assignee_id = COALESCE($3, assignee_id),
          priority = COALESCE($4, priority),
          due_date = COALESCE($5, due_date),
          status = COALESCE($6, status),
          status_remark = COALESCE($7, status_remark),
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $8 RETURNING *`,
        [name, description, assignee_id, priority, due_date, status, status_remark, id]
      );

      const updatedTask = result.rows[0];
      await pushEvent("task.updated", task.project_id, updatedTask);

      res.status(200).json({ code: 0, msg: "任务更新成功", data: updatedTask });
    } catch (error) {
      console.error("Update task error:", error);
      res.status(500).json({ code: 500, msg: "更新任务失败", data: null });
    }
  }
);

// 更新任务状态
app.patch(
  "/api/tasks/:id/status",
  authMiddleware(),
  auditLog("update_task_status", "task"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, remark } = req.body;

      const validStatuses = ["pending", "in_progress", "completed", "blocked", "cancelled"];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ code: 4001, msg: "无效的任务状态", data: null });
      }

      const taskResult = await pool.query(`SELECT * FROM tasks WHERE id = $1`, [id]);
      if (taskResult.rows.length === 0) {
        return res.status(404).json({ code: 404, msg: "任务不存在", data: null });
      }
      const task = taskResult.rows[0];

      const result = await pool.query(
        `UPDATE tasks SET status = $1, status_remark = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
        [status, remark, id]
      );

      const updatedTask = result.rows[0];
      await pushEvent(`task.status.${status}`, task.project_id, updatedTask);

      res.status(200).json({ code: 0, msg: "任务状态更新成功", data: updatedTask });
    } catch (error) {
      console.error("Update task status error:", error);
      res.status(500).json({ code: 500, msg: "更新任务状态失败", data: null });
    }
  }
);

// 删除任务
app.delete(
  "/api/tasks/:id",
  authMiddleware(),
  auditLog("delete_task", "task"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const taskResult = await pool.query(`SELECT * FROM tasks WHERE id = $1`, [id]);
      if (taskResult.rows.length === 0) {
        return res.status(404).json({ code: 404, msg: "任务不存在", data: null });
      }
      const task = taskResult.rows[0];

      await pool.query(`DELETE FROM tasks WHERE id = $1`, [id]);
      await pushEvent("task.deleted", task.project_id, { id });

      res.status(200).json({ code: 0, msg: "任务删除成功", data: null });
    } catch (error) {
      console.error("Delete task error:", error);
      res.status(500).json({ code: 500, msg: "删除任务失败", data: null });
    }
  }
);

// ==========================================
// 事件订阅API (US010)
// ==========================================

// 创建订阅
app.post("/api/subscriptions", authMiddleware(), async (req, res) => {
  try {
    const { project_id, event_types, callback_url, secret } = req.body;

    if (!event_types || !callback_url) {
      return res.status(400).json({
        code: 4001,
        msg: "事件类型和回调地址不能为空",
        data: null,
      });
    }

    const result = await pool.query(
      `INSERT INTO subscriptions (project_id, event_types, callback_url, secret)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        project_id,
        Array.isArray(event_types) ? event_types : [event_types],
        callback_url,
        secret,
      ]
    );

    res.status(201).json({ code: 0, msg: "订阅创建成功", data: result.rows[0] });
  } catch (error) {
    console.error("Create subscription error:", error);
    res.status(500).json({ code: 500, msg: "创建订阅失败", data: null });
  }
});

// 查询订阅列表
app.get("/api/subscriptions", authMiddleware(), async (req, res) => {
  try {
    const { project_id, is_active } = req.query;

    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (project_id) {
      whereClause += ` AND project_id = $${paramIndex++}`;
      params.push(project_id);
    }
    if (is_active !== undefined) {
      whereClause += ` AND is_active = $${paramIndex++}`;
      params.push(is_active === "true");
    }

    const result = await pool.query(
      `SELECT * FROM subscriptions ${whereClause} ORDER BY created_at DESC`,
      params
    );

    res.status(200).json({ code: 0, msg: "success", data: result.rows });
  } catch (error) {
    console.error("Get subscriptions error:", error);
    res.status(500).json({ code: 500, msg: "查询订阅列表失败", data: null });
  }
});

// 更新订阅
app.put("/api/subscriptions/:id", authMiddleware(), async (req, res) => {
  try {
    const { id } = req.params;
    const { event_types, callback_url, secret, is_active } = req.body;

    const subResult = await pool.query(`SELECT * FROM subscriptions WHERE id = $1`, [id]);
    if (subResult.rows.length === 0) {
      return res.status(404).json({ code: 404, msg: "订阅不存在", data: null });
    }

    const result = await pool.query(
      `UPDATE subscriptions SET 
        event_types = COALESCE($1, event_types),
        callback_url = COALESCE($2, callback_url),
        secret = COALESCE($3, secret),
        is_active = COALESCE($4, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [
        Array.isArray(event_types) ? event_types : undefined,
        callback_url,
        secret,
        is_active,
        id,
      ]
    );

    res.status(200).json({ code: 0, msg: "订阅更新成功", data: result.rows[0] });
  } catch (error) {
    console.error("Update subscription error:", error);
    res.status(500).json({ code: 500, msg: "更新订阅失败", data: null });
  }
});

// 删除订阅
app.delete("/api/subscriptions/:id", authMiddleware(), async (req, res) => {
  try {
    const { id } = req.params;

    const subResult = await pool.query(`SELECT * FROM subscriptions WHERE id = $1`, [id]);
    if (subResult.rows.length === 0) {
      return res.status(404).json({ code: 404, msg: "订阅不存在", data: null });
    }

    await pool.query(`DELETE FROM subscriptions WHERE id = $1`, [id]);
    res.status(200).json({ code: 0, msg: "订阅删除成功", data: null });
  } catch (error) {
    console.error("Delete subscription error:", error);
    res.status(500).json({ code: 500, msg: "删除订阅失败", data: null });
  }
});

// 触发事件（内部接口）
app.post("/api/events/trigger", async (req, res) => {
  try {
    const { event_type, project_id, data } = req.body;
    if (!event_type) {
      return res.status(400).json({ code: 4001, msg: "事件类型不能为空", data: null });
    }

    await pushEvent(event_type, project_id, data);
    res.status(200).json({ code: 0, msg: "事件触发成功", data: null });
  } catch (error) {
    console.error("Trigger event error:", error);
    res.status(500).json({ code: 500, msg: "触发事件失败", data: null });
  }
});

// ==========================================
// 审计日志API (US017, US020)
// ==========================================

// 查询审计日志
app.get("/api/audit-logs", authMiddleware(["admin"]), async (req, res) => {
  try {
    const { page = 1, pageSize = 20, project_id, user_id, action, start_time, end_time } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    let whereClause = "WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (project_id) {
      whereClause += ` AND project_id = $${paramIndex++}`;
      params.push(project_id);
    }
    if (user_id) {
      whereClause += ` AND user_id = $${paramIndex++}`;
      params.push(user_id);
    }
    if (action) {
      whereClause += ` AND action = $${paramIndex++}`;
      params.push(action);
    }
    if (start_time) {
      whereClause += ` AND created_at >= $${paramIndex++}`;
      params.push(new Date(start_time as string));
    }
    if (end_time) {
      whereClause += ` AND created_at <= $${paramIndex++}`;
      params.push(new Date(end_time as string));
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM audit_logs ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT * FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, Number(pageSize), offset]
    );

    res.status(200).json({
      code: 0,
      msg: "success",
      data: {
        list: result.rows,
        total,
        page: Number(page),
        pageSize: Number(pageSize),
      },
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({ code: 500, msg: "查询审计日志失败", data: null });
  }
});

// ==========================================
// 404处理
// ==========================================
app.all("*", (req, res) => {
  res.status(404).json({ code: 404, msg: "Not found", data: null });
});

// ==========================================
// 全局错误处理
// ==========================================
app.use((err: Error, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ code: 500, msg: "Internal server error", data: null });
});

// ==========================================
// 启动服务
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 服务启动成功，运行在端口 ${PORT}`);
  console.log(`🔍 健康检查: http://localhost:${PORT}/health`);
  console.log(`📚 API文档: http://localhost:${PORT}/api-docs`);
  console.log(`✅ 迭代1所有后端API已实现完毕`);
});

export default app;
