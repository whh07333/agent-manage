import { Request, Response } from 'express';
import { TaskService } from '../services/tasks';
import { validateTaskData, escapeHtml } from '../utils/validation';
import { logger } from '../utils/logger';

const taskService = new TaskService();

export const getAllTasks = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  try {
    logger.info('Fetching all tasks', { requestId });
    const tasks = await taskService.getAllTasks();
    logger.info(`Successfully fetched ${tasks.length} tasks`, { requestId, count: tasks.length });
    res.json({
      code: 0,
      msg: 'Success',
      data: tasks,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to fetch all tasks', error as Error, { requestId });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const { id } = req.params;
  try {
    logger.info('Fetching task by ID', { requestId, taskId: id });
    const task = await taskService.getTaskById(id);
    if (!task) {
      logger.warn('Task not found', { requestId, taskId: id });
      return res.status(404).json({
        code: 404,
        msg: 'Task not found',
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString()
      });
    }
    logger.info('Task found', { requestId, taskId: id });
    res.json({
      code: 0,
      msg: 'Success',
      data: task,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to fetch task', error as Error, { requestId, taskId: id });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

export const getTasksByProject = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const { projectId } = req.params;
  try {
    logger.info('Fetching tasks by project', { requestId, projectId });
    const tasks = await taskService.getTasksByProject(projectId);
    logger.info(`Successfully fetched ${tasks.length} tasks for project ${projectId}`, { requestId, projectId, count: tasks.length });
    res.json({
      code: 0,
      msg: 'Success',
      data: tasks,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to fetch tasks by project', error as Error, { requestId, projectId });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

export const getTasksByAssignee = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const { assigneeId } = req.params;
  try {
    logger.info('Fetching tasks by assignee', { requestId, assigneeId });
    const tasks = await taskService.getTasksByAssignee(assigneeId);
    logger.info(`Successfully fetched ${tasks.length} tasks for assignee ${assigneeId}`, { requestId, assigneeId, count: tasks.length });
    res.json({
      code: 0,
      msg: 'Success',
      data: tasks,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to fetch tasks by assignee', error as Error, { requestId, assigneeId });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

export const getTasksByStatus = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const { status } = req.params;
  try {
    logger.info('Fetching tasks by status', { requestId, status });
    const tasks = await taskService.getTasksByStatus(status);
    logger.info(`Successfully fetched ${tasks.length} tasks with status ${status}`, { requestId, status, count: tasks.length });
    res.json({
      code: 0,
      msg: 'Success',
      data: tasks,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to fetch tasks by status', error as Error, { requestId, status });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

export const createTask = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  try {
    logger.info('Creating new task', { requestId, body: req.body });

    // 验证请求数据并转义HTML防止XSS（更新操作）
    const validation = validateTaskData(req.body, true);
    if (!validation.valid) {
      logger.warn('Task creation validation failed', { requestId, message: validation.message });
      return res.status(400).json({
        code: 400,
        msg: validation.message,
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString()
      });
    }

    const task = await taskService.createTask(validation.escapedData!);
    logger.info('Task created successfully', { requestId, taskId: task.id });
    res.status(201).json({
      code: 0,
      msg: 'Task created successfully',
      data: task,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to create task', error as Error, { requestId });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const { id } = req.params;
  try {
    logger.info('Updating task', { requestId, taskId: id, body: req.body });

    // 验证请求数据并转义HTML防止XSS（更新操作）
    const validation = validateTaskData(req.body, true);
    if (!validation.valid) {
      logger.warn('Task update validation failed', { requestId, message: validation.message });
      return res.status(400).json({
        code: 400,
        msg: validation.message,
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString()
      });
    }

    const task = await taskService.updateTask(id, validation.escapedData!);
    if (!task) {
      logger.warn('Task not found for update', { requestId, taskId: id });
      return res.status(404).json({
        code: 404,
        msg: 'Task not found',
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString()
      });
    }
    logger.info('Task updated successfully', { requestId, taskId: id });
    res.json({
      code: 0,
      msg: 'Task updated successfully',
      data: task,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to update task', error as Error, { requestId, taskId: id });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const { id } = req.params;
  try {
    logger.info('Deleting task', { requestId, taskId: id });
    const deleted = await taskService.deleteTask(id);
    if (!deleted) {
      logger.warn('Task not found for deletion', { requestId, taskId: id });
      return res.status(404).json({
        code: 404,
        msg: 'Task not found',
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString()
      });
    }
    logger.info('Task deleted successfully', { requestId, taskId: id });
    res.json({
      code: 0,
      msg: 'Task deleted successfully',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to delete task', error as Error, { requestId, taskId: id });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

export const acceptTask = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const { id } = req.params;
  try {
    logger.info('Accepting task', { requestId, taskId: id });
    const task = await taskService.acceptTask(id);
    if (!task) {
      logger.warn('Task not found for acceptance', { requestId, taskId: id });
      return res.status(404).json({
        code: 404,
        msg: 'Task not found',
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString()
      });
    }
    res.json({
      code: 0,
      msg: 'Task accepted successfully',
      data: task,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to accept task', error as Error, { requestId, taskId: id });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * 任务验收 - 验收通过或不通过
 */
export const acceptanceTask = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const { id } = req.params;
  const { result, comment } = req.body;
  const acceptorId = (req as any).user.id;
  
  try {
  
  // DEF-IT2-3-011: 验证result参数必填
  if (!result || typeof result !== 'string') {
    logger.warn('Task acceptance validation failed: result is required', { requestId });
    return res.status(400).json({
      code: 400,
      msg: 'result is required',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
  
  // DEF-IT2-3-012: 验证result只能是approved或rejected
  if (!['approved', 'rejected'].includes(result)) {
    logger.warn('Task acceptance validation failed: invalid result value', { requestId, result });
    return res.status(400).json({
      code: 400,
      msg: 'result must be either approved or rejected',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
  
  // DEF-IT2-3-010: 验收不通过时意见必填
  if (result === 'rejected' && (!comment || typeof comment !== 'string' || comment.trim() === '')) {
    logger.warn('Task acceptance validation failed: comment is required when rejected', { requestId });
    return res.status(400).json({
      code: 400,
      msg: 'Comment is required when result is rejected',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
  
  // Escape comment if provided
  let escapedComment = comment || '';
  if (escapedComment && typeof escapedComment === 'string') {
    escapedComment = escapeHtml(escapedComment);
  }
  
  logger.info('Processing task acceptance', { 
    requestId, 
    taskId: id, 
    result, 
    acceptorId 
  });
  
  const task = await taskService.acceptanceTask(id, result as 'approved' | 'rejected', escapedComment, acceptorId);
  
  if (!task) {
    logger.warn('Task not found for acceptance', { requestId, taskId: id });
    return res.status(404).json({
      code: 404,
      msg: 'Task not found',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    code: 0,
    msg: `Task acceptance processed: ${result}`,
    data: task,
    trace_id: requestId,
    timestamp: new Date().toISOString()
  });
  } catch (error) {
    logger.error('Failed to process task acceptance', error as Error, { requestId, taskId: id });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

export const blockTask = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const { id } = req.params;
  const { reason, impact, relatedTasks } = req.body;
  const blockerId = (req as any).user.id;
  try {
    // Get task first to check status - DEF-IT2-3-015
    const existingTask = await taskService.getTaskById(id);
    if (!existingTask) {
      return res.status(404).json({
        code: 404,
        msg: 'Task not found',
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString()
      });
    }
    
    // DEF-IT2-3-015: 已完成任务不能阻塞
    if (existingTask.status === 'completed') {
      logger.warn('Cannot block completed task', { requestId, taskId: id });
      return res.status(400).json({
        code: 400,
        msg: 'Cannot block completed task',
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString()
      });
    }
    
    // DEF-IT2-3-032: 权限验证 - 只有任务负责人或管理员可以阻塞任务
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    if (existingTask.assigneeId !== userId && userRole !== 'admin') {
      logger.warn('Permission denied: cannot block task', { requestId, taskId: id, userId });
      return res.status(403).json({
        code: 403,
        msg: 'Permission denied. Only task assignee or admin can block task',
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString()
      });
    }
    
    // DEF-IT2-3-013: 阻塞原因必填
    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
      logger.warn('Block task validation failed: reason is required', { requestId });
      return res.status(400).json({
        code: 400,
        msg: 'Reason is required',
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString()
      });
    }
    
    // DEF-IT2-3-014: 影响范围必填
    if (!impact || typeof impact !== 'string' || impact.trim() === '') {
      logger.warn('Block task validation failed: impact is required', { requestId });
      return res.status(400).json({
        code: 400,
        msg: 'Impact is required',
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString()
      });
    }
    
    // Escape reason and impact if provided
    let escapedReason = reason || '';
    if (escapedReason && typeof escapedReason === 'string') {
      escapedReason = escapeHtml(escapedReason);
    }
    
    let escapedImpact = impact || '';
    if (escapedImpact && typeof escapedImpact === 'string') {
      escapedImpact = escapeHtml(escapedImpact);
    }
    
    logger.info('Blocking task', { requestId, taskId: id, reason: escapedReason, impact: escapedImpact, blockerId });
    const task = await taskService.blockTask(id, escapedReason, escapedImpact, relatedTasks || [], blockerId);
    if (!task) {
      logger.warn('Task not found for blocking', { requestId, taskId: id });
      return res.status(404).json({
        code: 404,
        msg: 'Task not found',
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString()
      });
    }
    res.json({
      code: 0,
      msg: 'Task blocked successfully',
      data: task,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to block task', error as Error, { requestId, taskId: id });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

export const unblockTask = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const { id } = req.params;
  const { resolution } = req.body;
  const resolvedBy = (req as any).user.id;
  try {
    // Escape resolution if provided
    let escapedResolution = resolution || '';
    if (escapedResolution && typeof escapedResolution === 'string') {
      escapedResolution = escapeHtml(escapedResolution);
    }
    
    logger.info('Unblocking task', { requestId, taskId: id, resolvedBy });
    const task = await taskService.unblockTask(id, resolvedBy, escapedResolution);
    if (!task) {
      logger.warn('Task not found for unblocking', { requestId, taskId: id });
      return res.status(404).json({
        code: 404,
        msg: 'Task not found',
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString()
      });
    }
    res.json({
      code: 0,
      msg: 'Task unblocked successfully',
      data: task,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to unblock task', error as Error, { requestId, taskId: id });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

export const getTaskStatistics = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const { projectId } = req.params;
  try {
    logger.info('Getting task statistics', { requestId, projectId });
    const stats = await taskService.getTaskStatistics(projectId);
    logger.info('Task statistics retrieved successfully', { requestId, projectId });
    res.json({
      code: 0,
      msg: 'Success',
      data: stats,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get task statistics', error as Error, { requestId, projectId });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};
