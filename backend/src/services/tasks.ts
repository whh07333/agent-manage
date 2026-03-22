import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { BlockRecord } from '../models/BlockRecord';
import { logger } from '../utils/logger';
import { Op } from 'sequelize';

export class TaskService {

  /**
   * 获取所有任务
   */
  async getAllTasks(): Promise<Task[]> {
    try {
      const tasks = await Task.findAll({
        order: [['dueDate', 'ASC']]
      });

      logger.info(`Fetched ${tasks.length} tasks total`, { count: tasks.length });
      return tasks;
    } catch (error) {
      logger.error('Failed to fetch all tasks', error as Error);
      throw error;
    }
  }

  /**
   * 获取单个任务详情
   */
  async getTaskById(id: string): Promise<Task | null> {
    try {
      const task = await Task.findByPk(id);
      return task;
    } catch (error) {
      logger.error(`Failed to fetch task with ID: ${id}`, error as Error);
      throw error;
    }
  }

  /**
   * 获取项目的所有任务
   */
  async getTasksByProject(projectId: string): Promise<Task[]> {
    try {
      const tasks = await Task.findAll({
        where: { projectId },
        order: [['dueDate', 'ASC']]
      });

      logger.info(`Fetched ${tasks.length} tasks for project ${projectId}`, { projectId, count: tasks.length });
      return tasks;
    } catch (error) {
      logger.error('Failed to fetch tasks by project', error as Error, { projectId });
      throw error;
    }
  }

  /**
   * 获取分配给用户的所有任务
   */
  async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    try {
      const tasks = await Task.findAll({
        where: { assigneeId },
        order: [['dueDate', 'ASC']]
      });

      logger.info(`Fetched ${tasks.length} tasks for assignee ${assigneeId}`, { assigneeId, count: tasks.length });
      return tasks;
    } catch (error) {
      logger.error('Failed to fetch tasks by assignee', error as Error, { assigneeId });
      throw error;
    }
  }

  /**
   * 根据状态筛选任务
   */
  async getTasksByStatus(status: string): Promise<Task[]> {
    try {
      const tasks = await Task.findAll({
        where: { status },
        order: [['dueDate', 'ASC']]
      });

      logger.info(`Fetched ${tasks.length} tasks with status ${status}`, { status, count: tasks.length });
      return tasks;
    } catch (error) {
      logger.error('Failed to fetch tasks by status', error as Error, { status });
      throw error;
    }
  }

  /**
   * 创建新任务
   */
  async createTask(data: {
    name: string;
    description?: string;
    projectId: string;
    assigneeId?: string;
    parentId?: string;
    priority?: string;
    status?: string;
    statusRemark?: string;
    dueDate?: Date;
  }): Promise<Task> {
    try {
      const task = await Task.create(data);
      logger.info('Task created successfully', { taskId: task.id, name: task.name });
      return task;
    } catch (error) {
      logger.error('Failed to create task', error as Error);
      throw error;
    }
  }

  /**
   * 更新任务
   */
  async updateTask(id: string, data: {
    name?: string;
    description?: string;
    assigneeId?: string;
    priority?: string;
    status?: string;
    statusRemark?: string;
    dueDate?: Date;
  }): Promise<Task | null> {
    try {
      const [affectedCount] = await Task.update(data, { where: { id } });
      if (affectedCount === 0) {
        return null;
      }
      const task = await Task.findByPk(id);
      logger.info('Task updated successfully', { taskId: id });
      return task;
    } catch (error) {
      logger.error(`Failed to update task with ID: ${id}`, error as Error);
      throw error;
    }
  }

  /**
   * 删除任务
   */
  async deleteTask(id: string): Promise<boolean> {
    try {
      const deletedCount = await Task.destroy({ where: { id } });
      logger.info('Task deleted successfully', { taskId: id });
      return deletedCount > 0;
    } catch (error) {
      logger.error(`Failed to delete task with ID: ${id}`, error as Error);
      throw error;
    }
  }

  /**
   * 接受任务 - 任务认领
   */
  async acceptTask(id: string): Promise<Task | null> {
    try {
      const [affectedCount] = await Task.update(
        { status: 'in_progress' },
        { where: { id } }
      );
      if (affectedCount === 0) {
        return null;
      }
      const task = await Task.findByPk(id);
      logger.info('Task accepted successfully', { taskId: id });
      return task;
    } catch (error) {
      logger.error(`Failed to accept task with ID: ${id}`, error as Error);
      throw error;
    }
  }

  /**
   * 任务验收 - 根据验收结果设置状态
   * @param result approved - 验收通过 -> completed, rejected -> in_progress
   */
  async acceptanceTask(
    id: string,
    result: 'approved' | 'rejected',
    comment: string,
    acceptorId: string
  ): Promise<Task | null> {
    try {
      let newStatus: 'completed' | 'in_progress';
      
      if (result === 'approved') {
        newStatus = 'completed';
      } else {
        newStatus = 'in_progress';
      }
      
      const [affectedCount] = await Task.update(
        { 
          status: newStatus,
          statusRemark: comment
        },
        { where: { id } }
      );
      
      if (affectedCount === 0) {
        return null;
      }
      
      const task = await Task.findByPk(id);
      logger.info('Task acceptance processed', { 
        taskId: id, 
        result, 
        newStatus,
        acceptorId
      });
      
      return task;
    } catch (error) {
      logger.error(`Failed to process acceptance for task with ID: ${id}`, error as Error);
      throw error;
    }
  }

  /**
   * 阻塞任务
   */
  async blockTask(
    taskId: string,
    blockReason: string,
    relatedTasks: string[],
    blockerId: string
  ): Promise<Task | null> {
    try {
      const [affectedCount] = await Task.update(
        { status: 'blocked' },
        { where: { id: taskId } }
      );
      
      if (affectedCount === 0) {
        return null;
      }
      
      // 创建阻塞记录
      await BlockRecord.create({
        taskId,
        blockReason,
        relatedTasks,
        blockedBy: blockerId,
        blockedAt: new Date(),
        resolvedAt: null,
        resolvedBy: null
      });
      
      const task = await Task.findByPk(taskId);
      logger.info('Task blocked successfully', { 
        taskId, 
        blockReason 
      });
      
      return task;
    } catch (error) {
      logger.error(`Failed to block task with ID: ${taskId}`, error as Error);
      throw error;
    }
  }

  /**
   * 解决阻塞 - unblock task
   */
  async unblockTask(
    taskId: string,
    resolvedBy: string,
    resolution: string
  ): Promise<Task | null> {
    try {
      // 更新任务状态为 in_progress
      const [affectedCount] = await Task.update(
        { status: 'in_progress', statusRemark: resolution },
        { where: { id: taskId } }
      );
      
      if (affectedCount === 0) {
        return null;
      }
      
      // 更新阻塞记录
      await BlockRecord.update(
        { resolvedAt: new Date(), resolvedBy },
        { where: { taskId, resolvedAt: null } }
      );
      
      const task = await Task.findByPk(taskId);
      logger.info('Task unblocked successfully', { 
        taskId, 
        resolvedBy 
      });
      
      return task;
    } catch (error) {
      logger.error(`Failed to unblock task with ID: ${taskId}`, error as Error);
      throw error;
    }
  }

  /**
   * 获取任务统计信息
   */
  async getTaskStatistics(projectId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    try {
      const result = await Task.sequelize!.query(`
        SELECT status, COUNT(*) as count 
        FROM tasks 
        WHERE projectId = $1
        GROUP BY status
      `, { bind: [projectId] });
      
      const rows = result[0] as any[];
      const byStatus: Record<string, number> = {};
      let total = 0;
      
      rows.forEach(row => {
        byStatus[row.status] = parseInt(row.count);
        total += parseInt(row.count);
      });
      
      const priorityResult = await Task.sequelize!.query(`
        SELECT priority, COUNT(*) as count 
        FROM tasks 
        WHERE projectId = $1
        GROUP BY priority
      `, { bind: [projectId] });
      
      const priorityRows = priorityResult[0] as any[];
      const byPriority: Record<string, number> = {};
      
      priorityRows.forEach(row => {
        byPriority[row.priority] = parseInt(row.count);
      });
      
      return {
        total,
        byStatus,
        byPriority
      };
    } catch (error) {
      logger.error(`Failed to get task statistics for project: ${projectId}`, error as Error);
      throw error;
    }
  }
}
