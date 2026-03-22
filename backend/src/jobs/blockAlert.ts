import Task from "../models/Task";
import Project from "../models/Project";
import { Op } from 'sequelize';
import { BlockRecord } from '../models/BlockRecord';
import { logger } from '../utils/logger';
import { eventEmitter } from '../events/eventEmitter';

/**
 * 检查超时阻塞任务，发送告警
 * 如果任务阻塞超过24小时，自动发送告警给项目负责人
 */
export async function checkBlockedTasksForAlert() {
  try {
    logger.info('Checking for expired blocked Tasks...');

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Find all blocked Tasks where created_at < 24 hours ago and not resolved
    const blockedTasks = await Task.findAll({
      where: {
        status: 'blocked',
        created_at: {
          [Op.lt]: twentyFourHoursAgo
        }
      }
    });

    for (const task of blockedTasks) {
      // Get project to find manager
      const project = await Project.findByPk(task.projectId);
      if (project) {
        // Create block record
        await BlockRecord.create({
          taskId: task.id,
          project_id: project.id,
          managerId: project.managerId,
          blockedAt: task.createdAt,
          detectedAt: new Date(),
          resolved: false
        });

        // Emit event for notification
        eventEmitter.emit('task_blocked', {
          taskId: task.id,
          taskName: task.name,
          project_id: project.id,
          projectName: project.name,
          managerId: project.managerId,
          blockedDuration: 24 * 60 * 60 * 1000
        });

        logger.info('Blocked task detected and alert emitted', {
          taskId: task.id,
          project_id: project.id
        });
      }
    }

    logger.info(`Blocked task check completed, found ${blockedTasks.length} blocked tasks`);
  } catch (error) {
    logger.error('Error checking for blocked tasks', error as Error);
  }
}
