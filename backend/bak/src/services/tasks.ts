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
        }
      ]
    });
  }
}
