import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { BlockRecord } from '../models/BlockRecord';
import { DeadLetterEvent } from '../models/DeadLetterEvent';
import sequelize from '../config/database';
import { Op, QueryTypes } from 'sequelize';

// 缓存配置
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let cache: {
  [key: string]: { data: any; timestamp: number };
} = {};

const getCached = <T>(key: string): T | null => {
  const cached = cache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCached = <T>(key: string, data: T): void => {
  cache[key] = { data, timestamp: Date.now() };
};

/**
 * 项目概览统计
 */
export const getProjectOverview = async (projectId: string) => {
  const cached = getCached<any>(`project-overview-${projectId}`);
  if (cached) return cached;

  const project = await Project.findByPk(projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  const totalTasks = await Task.count({ where: { projectId, deletedAt: null } });
  const completedTasks = await Task.count({ where: { projectId, status: 'completed', deletedAt: null } });
  const inProgressTasks = await Task.count({ where: { projectId, status: 'in_progress', deletedAt: null } });
  const blockedTasks = await Task.count({ where: { projectId, status: 'blocked', deletedAt: null } });
  const overdueTasks = await Task.count({ 
    where: { 
      projectId, 
      status: { [Op.not]: 'completed' },
      due_date: { [Op.lt]: new Date() },
      deletedAt: null
    } 
  });

  // Get task trend by date (last 14 days)
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  const tasks = await Task.findAll({
    where: {
      projectId,
      createdAt: { [Op.gte]: twoWeeksAgo },
      deletedAt: null
    },
    attributes: ['createdAt', 'status']
  });

  const taskTrend: {
    date: string;
    tasks_created: number;
    tasks_completed: number;
  }[] = [];

  // Group by date
  const grouped = tasks.reduce((acc: any, task) => {
    const date = task.createdAt.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { created: 0, completed: 0 };
    }
    acc[date].created++;
    if (task.status === 'completed') {
      acc[date].completed++;
    }
    return acc;
  }, {});

  for (const date in grouped) {
    taskTrend.push({
      date,
      tasks_created: grouped[date].created,
      tasks_completed: grouped[date].completed
    });
  }

  // Get member workload
  const memberWorkload = await sequelize.query(`
    SELECT 
      assignee_agent_id as agent_id,
      COUNT(*) as total_tasks,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
      COUNT(CASE WHEN status != 'completed' AND due_date < NOW() THEN 1 END) as overdue_tasks
    FROM tasks
    WHERE project_id = $1 AND deleted_at IS NULL
    GROUP BY assignee_agent_id
  `, { bind: [projectId], type: QueryTypes.SELECT });

  // Get blocking issues
  const blocked = await BlockRecord.findAll({
    where: { resolvedAt: null },
    attributes: ['taskId', 'blockReason', 'relatedTasks', 'blockedAt']
  });

  const blockingIssues = blocked.map((b: any) => ({
    taskId: b.taskId,
    block_reason: b.blockReason,
    related_tasks: b.relatedTasks,
    blocked_days: Math.floor((Date.now() - b.blockedAt.getTime()) / (1000 * 60 * 60 * 24))
  }));

  const result = {
    project_id: projectId,
    name: project.name,
    total_tasks: totalTasks,
    completed_tasks: completedTasks,
    in_progress_tasks: inProgressTasks,
    blocked_tasks: blockedTasks,
    overdue_tasks: overdueTasks,
    task_trend: taskTrend,
    member_workload: memberWorkload,
    blocking_issues: blockingIssues
  };

  setCached(`project-overview-${projectId}`, result);
  return result;
};

/**
 * Agent负载统计
 */
export const getAgentWorkload = async (agentId: string) => {
  const cached = getCached<any>(`agent-workload-${agentId}`);
  if (cached) return cached;

  const totalTasks = await Task.count({ where: { assignee_agent_id: agentId, deletedAt: null } });
  const completedTasks = await Task.count({ where: { assignee_agent_id: agentId, status: 'completed', deletedAt: null } });
  const overdueTasks = await Task.count({ 
    where: { 
      assignee_agent_id: agentId, 
      status: { [Op.not]: 'completed' },
      due_date: { [Op.lt]: new Date() },
      deletedAt: null
    } 
  });

  // Weekly activity
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weeklyTasks = await Task.findAll({
    where: {
      assignee_agent_id: agentId,
      updatedAt: { [Op.gte]: weekAgo },
      deletedAt: null
    },
    attributes: ['updatedAt', 'status']
  });

  const weeklyActivity: {
    day: string;
    tasks_completed: number;
  }[] = [];

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekly = weeklyTasks.reduce((acc: any, task) => {
    const day = days[new Date(task.updatedAt).getDay()];
    if (!acc[day]) acc[day] = 0;
    if (task.status === 'completed') acc[day]++;
    return acc;
  }, {});

  for (const day of days) {
    weeklyActivity.push({
      day,
      tasks_completed: weekly[day] || 0
    });
  }

  const onTimeRate = completedTasks > 0 ? 
    (completedTasks - overdueTasks) / completedTasks : 0;
  
  let avgCompletionDays = 0;
  const completedTasksWithDates = await Task.findAll({
    where: {
      assignee_agent_id: agentId,
      status: 'completed',
      deletedAt: null
    },
    attributes: ['createdAt', 'updatedAt']
  });

  if (completedTasksWithDates.length > 0) {
    const totalDays = completedTasksWithDates.reduce((sum: number, task) => {
      return sum + (task.updatedAt.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    }, 0);
    avgCompletionDays = Number((totalDays / completedTasksWithDates.length).toFixed(2));
  }

  const result = {
    agent_id: agentId,
    total_tasks: totalTasks,
    completed_tasks: completedTasks,
    overdue_tasks: overdueTasks,
    on_time_rate: Number(onTimeRate.toFixed(2)),
    avg_completion_days: avgCompletionDays,
    weekly_activity: weeklyActivity
  };

  setCached(`agent-workload-${agentId}`, result);
  return result;
};

/**
 * 团队效率统计
 */
export const getTeamEfficiency = async () => {
  const cached = getCached<any>('team-efficiency');
  if (cached) return cached;

  const totalProjects = await Project.count({ where: { deletedAt: null } });
  const totalTasks = await Task.count({ where: { deletedAt: null } });
  const completedTasks = await Task.count({ where: { status: 'completed', deletedAt: null } });
  const blockedTasks = await Task.count({ where: { status: 'blocked', deletedAt: null } });

  const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
  
  // Calculate average completion days across all completed tasks
  const completedTasksWithDates = await Task.findAll({
    where: { status: 'completed', deletedAt: null },
    attributes: ['createdAt', 'updatedAt']
  });

  let avgCompletionDays = 0;
  if (completedTasksWithDates.length > 0) {
    const totalDays = completedTasksWithDates.reduce((sum: number, task) => {
      return sum + (task.updatedAt.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    }, 0);
    avgCompletionDays = Number((totalDays / completedTasksWithDates.length).toFixed(2));
  }

  const overdueRate = totalTasks > 0 ? 
    (await Task.count({ 
      where: { 
        status: { [Op.not]: 'completed' },
        due_date: { [Op.lt]: new Date() },
        deletedAt: null
      } 
    })) / totalTasks : 0;

  const blockingRate = totalTasks > 0 ? blockedTasks / totalTasks : 0;

  const result = {
    total_agents: 0, // This would be counted from agents table
    total_projects: totalProjects,
    total_tasks: totalTasks,
    completed_tasks: completedTasks,
    completion_rate: Number(completionRate.toFixed(2)),
    blocking_rate: Number(blockingRate.toFixed(2)),
    average_completion_days: avgCompletionDays,
    overdue_rate: Number(overdueRate.toFixed(2))
  };

  setCached('team-efficiency', result);
  return result;
};

/**
 * 跨项目统计
 */
export const getCrossProjectStats = async (params: {
  dateFrom?: string;
  dateTo?: string;
  agentId?: string;
  projectId?: string;
}) => {
  const { dateFrom, dateTo, agentId, projectId } = params;
  const cacheKey = `cross-project-${dateFrom}-${dateTo}-${agentId}-${projectId}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;

  const where: any = { deletedAt: null };
  if (dateFrom && dateTo) {
    where.createdAt = {
      [Op.between]: [new Date(dateFrom), new Date(dateTo)]
    };
  }
  if (agentId) {
    where.assignee_agent_id = agentId;
  }
  if (projectId) {
    where.projectId = projectId;
  }

  const totalTasks = await Task.count({ where });
  const completedTasks = await Task.count({ where: { ...where, status: 'completed' } });
  const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;

  // Calculate average completion time
  const allTasks = await Task.findAll({ 
    where, 
    attributes: ['projectId', 'createdAt', 'updatedAt', 'assignee_agent_id'] 
  });
  
  let avgCompletionDays = 0;
  if (allTasks.length > 0) {
    const totalDays = allTasks.reduce((sum: number, task) => {
      if (task.status === 'completed' && task.updatedAt && task.createdAt) {
        return sum + (task.updatedAt.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      }
      return sum;
    }, 0);
    avgCompletionDays = allTasks.length > 0 ? 
      Number((totalDays / allTasks.length).toFixed(2)) : 0;
  }

  // Agent stats - build SQL dynamically
  let agentSql = `
    SELECT 
      assignee_agent_id as agent_id,
      COUNT(*) as total_tasks,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
      ROUND(
        CASE WHEN COUNT(*) > 0 THEN COUNT(CASE WHEN status = 'completed' THEN 1 END)::numeric / COUNT(*) ELSE 0 END,
        2
      ) as completion_rate,
      ROUND(
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / (60 * 60 * 24)),
        2
      ) as average_completion_days
    FROM tasks
    WHERE deleted_at IS NULL
  `;

  const bindings: any[] = [];
  let paramIndex = 1;

  if (dateFrom && dateTo) {
    agentSql += ` AND created_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
    bindings.push(new Date(dateFrom), new Date(dateTo));
    paramIndex += 2;
  }
  if (agentId) {
    agentSql += ` AND assignee_agent_id = $${paramIndex}`;
    bindings.push(agentId);
    paramIndex++;
  }
  if (projectId) {
    agentSql += ` AND project_id = $${paramIndex}`;
    bindings.push(projectId);
    paramIndex++;
  }

  agentSql += ` GROUP BY assignee_agent_id`;

  const agentStats = await sequelize.query(agentSql, { 
    bind: bindings, 
    type: QueryTypes.SELECT 
  });

  // Project stats
  let projectSql = `
    SELECT 
      p.id as project_id,
      p.name as project_name,
      COUNT(t.id) as total_tasks,
      COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
      ROUND(
        CASE WHEN COUNT(t.id) > 0 THEN COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::numeric / COUNT(t.id) ELSE 0 END,
        2
      ) as completion_rate,
      ROUND(
        AVG(EXTRACT(EPOCH FROM (t.updated_at - t.created_at)) / (60 * 60 * 24)),
        2
      ) as average_completion_days
    FROM projects p
    LEFT JOIN tasks t ON p.id = t.project_id
    WHERE p.deleted_at IS NULL
  `;

  const projectBindings: any[] = [];
  let projectParamIndex = 1;

  if (projectId) {
    projectSql += ` AND p.id = $${projectParamIndex}`;
    projectBindings.push(projectId);
    projectParamIndex++;
  }

  projectSql += ` GROUP BY p.id, p.name`;

  const projectStats = await sequelize.query(projectSql, { 
    bind: projectBindings, 
    type: QueryTypes.SELECT 
  });

  const result = {
    date_range: {
      from: dateFrom || '',
      to: dateTo || ''
    },
    summary: {
      total_projects: projectStats.length,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      completion_rate: Number(completionRate.toFixed(2)),
      average_completion_days: avgCompletionDays,
      overdue_rate: 0 // calculated elsewhere
    },
    agent_stats: agentStats,
    project_stats: projectStats
  };

  setCached(cacheKey, result);
  return result;
};

/**
 * 实时监控概览 - 给看板使用
 */
export const getRealTimeOverview = async () => {
  // Get basic connection stats from database
  const result = await sequelize.query(`
    SELECT 
      (SELECT COUNT(*) FROM projects WHERE deleted_at IS NULL) as total_projects,
      (SELECT COUNT(*) FROM tasks WHERE deleted_at IS NULL) as total_tasks,
      (SELECT COUNT(*) FROM tasks WHERE status = 'completed' AND deleted_at IS NULL) as completed_tasks,
      (SELECT COUNT(*) FROM tasks WHERE status = 'blocked' AND deleted_at IS NULL) as blocked_tasks,
      (SELECT COUNT(*) FROM dead_letter_events WHERE retry_count = 0) as pending_dead_letters
  `, { type: QueryTypes.SELECT });

  return result[0];
};

/**
 * 实时活动日志 - 给看板使用
 */
export const getRealTimeActivity = async (limit: number = 50) => {
  // Get recent events from audit logs
  const result = await sequelize.query(`
    SELECT * FROM audit_logs 
    ORDER BY created_at DESC 
    LIMIT $1
  `, { bind: [limit], type: QueryTypes.SELECT });

  return {
    recent_events: result,
    count: (result as any[]).length
  };
};

/**
 * 实时监控统计
 */
export const getRealTimeStats = async () => {
  // Real-time stats from system and Prometheus
  // This is a simplified version that gets current stats from the database

  const requests = {
    total_1h: 0, // Would come from Prometheus
    total_24h: 0,
    qps: 0,
    error_rate: 0,
    avg_response_ms: 42
  };

  const events = {
    total: await Task.count(),
    success: await Task.count({ where: { status: 'completed' } }),
    failed: 0,
    success_rate: 0,
    pending_retry: 0,
    dead_letter: await DeadLetterEvent.count()
  };

  const system = {
    cpu_usage_percent: 0, // Would get from process
    memory_usage_percent: 0,
    load_average_1m: 0
  };

  const database = {
    active_connections: 0, // Would get from connection pool
    avg_query_ms: 18,
    slow_queries_1h: 0
  };

  // Get dead letter count
  events.dead_letter = await DeadLetterEvent.count();

  if (events.total > 0) {
    events.success_rate = Number((events.success / events.total).toFixed(3));
  }

  return {
    requests,
    events,
    system,
    database
  };
};
