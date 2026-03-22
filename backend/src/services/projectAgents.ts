import { ProjectAgent } from '../models/ProjectAgent';
import { Op } from 'sequelize';

export class ProjectAgentService {
  /**
   * Get all project agents
   */
  async getAllProjectAgents(): Promise<ProjectAgent[]> {
    return ProjectAgent.findAll({
      where: { isActive: true }
    });
  }

  /**
   * Get project agent by id
   */
  async getProjectAgentById(id: string): Promise<ProjectAgent | null> {
    return ProjectAgent.findByPk(id);
  }

  /**
   * Get all agents for a project
   */
  async getProjectAgentsByProjectId(projectId: string): Promise<ProjectAgent[]> {
    return ProjectAgent.findAll({
      where: { projectId, isActive: true }
    });
  }

  /**
   * Get all projects for an agent
   */
  async getProjectAgentsByAgentId(agentId: string): Promise<ProjectAgent[]> {
    return ProjectAgent.findAll({
      where: { agentId, isActive: true }
    });
  }

  /**
   * Create project agent
   * Support both camelCase (projectId/agentId) and snake_case (project_id/agent_id)
   */
  async createProjectAgent(data: any): Promise<ProjectAgent> {
    // Get projectId - try camelCase first, then snake_case
    const projectId = 'projectId' in data ? data.projectId : 
                     ('project_id' in data ? data.project_id : undefined);
    
    // Get agentId - try camelCase first, then snake_case
    const agentId = 'agentId' in data ? data.agentId : 
                   ('agent_id' in data ? data.agent_id : undefined);
    
    // isActive
    const isActive = 'isActive' in data ? data.isActive : 
                     ('is_active' in data ? data.is_active : true);

    const role = data.role || 'member';

    return ProjectAgent.create({
      projectId,
      agentId,
      role,
      isActive
    });
  }

  /**
   * Update project agent
   */
  async updateProjectAgent(id: string, data: any): Promise<ProjectAgent | null> {
    const projectAgent = await this.getProjectAgentById(id);
    if (!projectAgent) return null;

    return projectAgent.update(data);
  }

  /**
   * Soft delete project agent
   */
  async deleteProjectAgent(id: string): Promise<void> {
    const projectAgent = await this.getProjectAgentById(id);
    if (projectAgent) {
      await projectAgent.update({ isActive: false });
    }
  }

  /**
   * Restore project agent (soft delete undo)
   */
  async restoreProjectAgent(id: string): Promise<void> {
    const projectAgent = await this.getProjectAgentById(id);
    if (projectAgent) {
      await projectAgent.update({ isActive: true });
    }
  }

  /**
   * Delete all agents for a project (soft delete)
   */
  async deleteProjectAgentsByProjectId(projectId: string): Promise<void> {
    await ProjectAgent.update(
      { isActive: false },
      { where: { projectId, isActive: true } }
    );
  }

  /**
   * Delete all projects for an agent (soft delete)
   */
  async deleteProjectAgentsByAgentId(agentId: string): Promise<void> {
    await ProjectAgent.update(
      { isActive: false },
      { where: { agentId, isActive: true } }
    );
  }
}
