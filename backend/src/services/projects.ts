import { Project } from '../models/Project';
import { ProjectAgent } from '../models/ProjectAgent';
import { Op } from 'sequelize';
import { logger } from '../utils/logger';

export class ProjectService {
  /**
   * Get all projects
   */
  async getAllProjects() {
    return Project.findAll({
      where: { deletedAt: null },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Get project by ID
   */
  async getProjectById(id: string) {
    return Project.findByPk(id);
  }

  /**
   * Create new project
   */
  async createProject(data: any) {
    const project = await Project.create(data);
    // If project has agents, create them
    if (data.agentIds && Array.isArray(data.agentIds) && data.agentIds.length > 0) {
      const projectAgentRecords = data.agentIds.map((agentId: string) => ({
        projectId: project.id,
        agentId,
        role: 'member',
        isActive: true
      }));
      await ProjectAgent.bulkCreate(projectAgentRecords);
      logger.info('Project agents updated', { projectId: project.id, agentCount: data.agentIds.length });
    }
    return this.toProjectResponse(project);
  }

  /**
   * Update project
   */
  async updateProject(id: string, data: any) {
    const project = await Project.findByPk(id);
    if (!project) return null;

    await project.update(data);
    // Update project agents if provided
    if (data.agentIds && Array.isArray(data.agentIds)) {
      // Delete existing agents
      await ProjectAgent.destroy({ where: { projectId: id } });
      // Create new agents
      const projectAgentRecords = data.agentIds.map((agentId: string) => ({
        projectId: id,
        agentId,
        role: 'member',
        isActive: true
      }));
      await ProjectAgent.bulkCreate(projectAgentRecords);
      logger.info('Project agents updated', { projectId: id, agentCount: data.agentIds.length });
    }
    return this.toProjectResponse(project);
  }

  /**
   * Delete (archive) project - soft delete
   * Only project manager or admin can do this
   */
  async deleteProject(id: string, archivedBy: string, archiveNote: string | null): Promise<boolean> {
    try {
      const project = await Project.findByPk(id);
      if (!project) {
        logger.warn('Project not found for deletion', { projectId: id });
        return false;
      }

      await project.update({ 
        status: 'archived', 
        isArchived: true,
        archiveNote: archiveNote,
        archivedAt: new Date(),
        archivedBy: archivedBy
      });
      logger.info('Project archived successfully', { projectId: id });
      return true;
    } catch (error) {
      logger.error('Failed to archive project', error as Error, { projectId: id });
      throw error;
    }
  }

  /**
   * Archive project
   */
  async archiveProject(id: string, archivedBy: string, archiveNote: string | null): Promise<boolean> {
    return this.deleteProject(id, archivedBy, archiveNote);
  }

  /**
   * Unarchive project
   * Only project manager or admin can do this
   */
  async unarchiveProject(id: string): Promise<boolean> {
    try {
      const project = await Project.findByPk(id);
      if (!project) {
        logger.warn('Project not found for unarchive', { projectId: id });
        return false;
      }

      await project.update({ 
        status: 'active', 
        isArchived: false
      });
      logger.info('Project unarchived successfully', { projectId: id });
      return true;
    } catch (error) {
      logger.error('Failed to unarchive project', error as Error, { projectId: id });
      throw error;
    }
  }

  /**
   * Get projects by manager
   */
  async getProjectsByManager(managerId: string) {
    return Project.findAll({
      where: { managerId: managerId, deletedAt: null },
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Convert to response
   */
  private toProjectResponse(project: Project) {
    return project.get({ plain: true });
  }
}

export default ProjectService;
