import { ProjectAgent } from '../models/ProjectAgent';

export class ProjectAgentService {
  async getAllProjectAgents(): Promise<ProjectAgent[]> {
    return ProjectAgent.findAll({
      where: { is_active: true },
      order: [['created_at', 'DESC']]
    });
  }

  async getProjectAgentById(id: string): Promise<ProjectAgent | null> {
    return ProjectAgent.findByPk(id);
  }

  async getProjectAgentsByProjectId(projectId: string): Promise<ProjectAgent[]> {
    return ProjectAgent.findAll({
      where: {
        project_id: projectId,
        is_active: true
      },
      order: [['created_at', 'DESC']]
    });
  }

  async getProjectAgentsByAgentId(agentId: string): Promise<ProjectAgent[]> {
    return ProjectAgent.findAll({
      where: {
        agent_id: agentId,
        is_active: true
      },
      order: [['created_at', 'DESC']]
    });
  }

  async createProjectAgent(data: any): Promise<ProjectAgent> {
    return ProjectAgent.create({
      project_id: data.project_id,
      agent_id: data.agent_id,
      role: data.role || 'member',
      is_active: data.is_active !== undefined ? data.is_active : true
    });
  }

  async updateProjectAgent(id: string, data: any): Promise<ProjectAgent | null> {
    const projectAgent = await this.getProjectAgentById(id);
    if (!projectAgent) return null;

    return projectAgent.update(data);
  }

  async deleteProjectAgent(id: string): Promise<void> {
    const projectAgent = await this.getProjectAgentById(id);
    if (projectAgent) {
      await projectAgent.update({ is_active: false });
    }
  }

  async restoreProjectAgent(id: string): Promise<void> {
    const projectAgent = await this.getProjectAgentById(id);
    if (projectAgent) {
      await projectAgent.update({ is_active: true });
    }
  }

  async deleteProjectAgentsByProjectId(projectId: string): Promise<void> {
    await ProjectAgent.update(
      { is_active: false },
      { where: { project_id: projectId } }
    );
  }

  async deleteProjectAgentsByAgentId(agentId: string): Promise<void> {
    await ProjectAgent.update(
      { is_active: false },
      { where: { agent_id: agentId } }
    );
  }
}
