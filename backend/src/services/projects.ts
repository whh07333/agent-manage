import { Project } from '../models/Project';
import { Op } from 'sequelize';

export class ProjectService {
  async getAllProjects(): Promise<Project[]> {
    return Project.findAll({
      where: { is_archived: false },
      order: [['created_at', 'DESC']]
    });
  }

  async getProjectById(id: string): Promise<Project | null> {
    return Project.findByPk(id);
  }

  async createProject(data: any): Promise<Project> {
    return Project.create({
      name: data.name,
      description: data.description,
      manager_id: data.manager_id,
      priority: data.priority || 'medium',
      status: data.status || 'active',
      due_date: data.due_date
    });
  }

  async updateProject(id: string, data: any): Promise<Project | null> {
    const project = await this.getProjectById(id);
    if (!project) return null;

    return project.update(data);
  }

  async deleteProject(id: string): Promise<void> {
    const project = await this.getProjectById(id);
    if (project) {
      await project.destroy();
    }
  }

  async archiveProject(id: string): Promise<void> {
    const project = await this.getProjectById(id);
    if (project) {
      await project.update({ is_archived: true });
    }
  }
}
