import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { Op } from 'sequelize';

export class TaskService {
  async getAllTasks(): Promise<Task[]> {
    return Task.findAll({
      include: [
        {
          model: Project,
          as: 'project'
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async getTaskById(id: string): Promise<Task | null> {
    return Task.findByPk(id, {
      include: [
        {
          model: Project,
          as: 'project'
        },
        {
          model: Task,
          as: 'predecessor'
        }
      ]
    });
  }

  async createTask(data: any): Promise<Task> {
    return Task.create({
      project_id: data.project_id,
      name: data.name,
      description: data.description,
      assignee_id: data.assignee_id,
      predecessor_task_id: data.predecessor_task_id || null,
      status: data.status || 'pending',
      priority: data.priority || 'medium',
      due_date: data.due_date
    });
  }

  async updateTask(id: string, data: any): Promise<Task | null> {
    const task = await this.getTaskById(id);
    if (!task) return null;

    return task.update(data);
  }

  async deleteTask(id: string): Promise<void> {
    const task = await this.getTaskById(id);
    if (task) {
      await task.destroy();
    }
  }

  async updateTaskStatus(id: string, status: string): Promise<Task | null> {
    const task = await this.getTaskById(id);
    if (!task) return null;

    // DEF-019 任务依赖验证 - 如果任务被设置为in_progress，必须检查前置任务是否已完成
    if (status === 'in_progress' && task.predecessor_task_id) {
      const predecessor = await Task.findByPk(task.predecessor_task_id);
      if (!predecessor || predecessor.status !== 'completed') {
        throw new Error('Cannot start this task: Predecessor task is not completed');
      }
    }

    return task.update({ status });
  }

  async assignTask(id: string, assignee_id: string): Promise<Task | null> {
    const task = await this.getTaskById(id);
    if (!task) return null;

    return task.update({ assignee_id });
  }

  async getTasksByProject(project_id: string): Promise<Task[]> {
    return Task.findAll({
      where: { project_id },
      include: [
        {
          model: Task,
          as: 'predecessor'
        }
      ],
      order: [['due_date', 'ASC']]
    });
  }

  async getTasksByAssignee(assignee_id: string): Promise<Task[]> {
    return Task.findAll({
      where: { assignee_id },
      include: [
        {
          model: Project,
          as: 'project'
        },
        {
          model: Task,
          as: 'predecessor'
        }
      ]
    });
  }
}
