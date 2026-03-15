import { Project } from '../models/Project';
import { User } from '../models/User';
import { ProjectAgent } from '../models/ProjectAgent';
import { Op } from 'sequelize';
import { CreateProjectRequest, UpdateProjectRequest, ProjectResponse } from '../types/project';
import { logger } from '../utils/logger';

export class ProjectService {

  /**
   * 将Project实例转换为ProjectResponse（包含agent_ids）
   */
  private async toProjectResponse(project: Project): Promise<ProjectResponse> {
    // 获取项目的agent_ids
    const projectAgents = await ProjectAgent.findAll({
      where: { project_id: project.id, is_active: true },
      attributes: ['agent_id']
    });
    const agentIds = projectAgents.map(pa => pa.agent_id);

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      manager_id: project.manager_id,
      priority: project.priority,
      status: project.status,
      start_date: project.start_date,
      end_date: project.end_date,
      tags: project.tags,
      config: project.config,
      agent_ids: agentIds,
      created_at: project.created_at,
      updated_at: project.updated_at
    };
  }

  /**
   * 获取所有项目（不包含已归档的项目）
   */
  async getAllProjects(): Promise<ProjectResponse[]> {
    try {
      const projects = await Project.findAll({
        where: {
          status: { [Op.ne]: 'archived' } // 状态不等于archived
        },
        order: [['created_at', 'DESC']]
      });

      // 转换为ProjectResponse（不包含agent_ids以提升性能，列表页不需要）
      const projectResponses: ProjectResponse[] = [];
      for (const project of projects) {
        projectResponses.push({
          id: project.id,
          name: project.name,
          description: project.description,
          manager_id: project.manager_id,
          priority: project.priority,
          status: project.status,
          start_date: project.start_date,
          end_date: project.end_date,
          tags: project.tags,
          config: project.config,
          agent_ids: [], // 列表页不返回agent_ids
          created_at: project.created_at,
          updated_at: project.updated_at
        });
      }

      logger.info(`Fetched ${projects.length} projects`, { count: projects.length });
      return projectResponses;
    } catch (error) {
      logger.error('Failed to fetch projects', error as Error, {});
      throw error;
    }
  }

  /**
   * 根据ID获取项目详情（包含agent_ids）
   */
  async getProjectById(id: string): Promise<ProjectResponse | null> {
    try {
      const project = await Project.findByPk(id);
      if (!project) {
        logger.warn(`Project not found with ID: ${id}`, { projectId: id });
        return null;
      }

      const response = await this.toProjectResponse(project);
      logger.info(`Fetched project details for ID: ${id}`, { projectId: id });
      return response;
    } catch (error) {
      logger.error(`Failed to fetch project with ID: ${id}`, error as Error, { projectId: id });
      throw error;
    }
  }

  /**
   * 创建新项目
   */
  async createProject(data: CreateProjectRequest): Promise<ProjectResponse> {
    try {
      logger.info('Starting project creation', { projectName: data.name, managerId: data.manager_id });

      // 验证manager_id对应的用户是否存在
      const manager = await User.findByPk(data.manager_id);
      if (!manager) {
        const error = new Error(`Manager with ID ${data.manager_id} not found`);
        logger.error('Manager not found', error, { managerId: data.manager_id });
        throw error;
      }

      // 验证用户是否活跃
      if (!manager.is_active) {
        const error = new Error(`Manager with ID ${data.manager_id} is not active`);
        logger.error('Manager not active', error, { managerId: data.manager_id });
        throw error;
      }

      // 创建项目
      const project = await Project.create({
        name: data.name,
        description: data.description,
        manager_id: data.manager_id,
        priority: data.priority || 'P1',
        status: data.status || 'active',
        start_date: data.start_date,
        end_date: data.end_date,
        tags: data.tags || [],
        config: data.config || {}
      });

      logger.info(`Project created with ID: ${project.id}`, { projectId: project.id });

      // 处理agent_ids - 创建项目成员关联
      if (data.agent_ids && data.agent_ids.length > 0) {
        const projectAgentRecords = data.agent_ids.map(agentId => ({
          project_id: project.id,
          agent_id: agentId,
          role: 'member',
          is_active: true
        }));

        await ProjectAgent.bulkCreate(projectAgentRecords);
        logger.info(`Added ${data.agent_ids.length} agents to project`, {
          projectId: project.id,
          agentCount: data.agent_ids.length
        });
      }

      const response = await this.toProjectResponse(project);
      logger.info('Project creation completed successfully', { projectId: project.id });
      return response;
    } catch (error) {
      logger.error('Failed to create project', error as Error, {
        projectName: data.name,
        managerId: data.manager_id
      });
      throw error;
    }
  }

  /**
   * 更新项目信息
   */
  async updateProject(id: string, data: UpdateProjectRequest): Promise<ProjectResponse | null> {
    try {
      logger.info('Starting project update', { projectId: id, updateData: data });

      const project = await Project.findByPk(id);
      if (!project) {
        logger.warn(`Project not found for update with ID: ${id}`, { projectId: id });
        return null;
      }

      // 如果更新manager_id，验证用户是否存在且活跃
      if (data.manager_id) {
        const manager = await User.findByPk(data.manager_id);
        if (!manager) {
          const error = new Error(`Manager with ID ${data.manager_id} not found`);
          logger.error('Manager not found during update', error, { managerId: data.manager_id });
          throw error;
        }
        if (!manager.is_active) {
          const error = new Error(`Manager with ID ${data.manager_id} is not active`);
          logger.error('Manager not active during update', error, { managerId: data.manager_id });
          throw error;
        }
      }

      // 更新项目基本信息
      await project.update({
        name: data.name,
        description: data.description,
        manager_id: data.manager_id,
        priority: data.priority,
        status: data.status,
        start_date: data.start_date,
        end_date: data.end_date,
        tags: data.tags,
        config: data.config
      });

      // 如果提供了agent_ids，更新项目成员关联
      if (data.agent_ids !== undefined) {
        // 先删除现有的关联
        await ProjectAgent.destroy({
          where: { project_id: id }
        });

        // 创建新的关联
        if (data.agent_ids.length > 0) {
          const projectAgentRecords = data.agent_ids.map(agentId => ({
            project_id: id,
            agent_id: agentId,
            role: 'member',
            is_active: true
          }));

          await ProjectAgent.bulkCreate(projectAgentRecords);
          logger.info(`Updated project agents, count: ${data.agent_ids.length}`, {
            projectId: id,
            agentCount: data.agent_ids.length
          });
        } else {
          logger.info('Cleared all project agents', { projectId: id });
        }
      }

      const response = await this.toProjectResponse(project);
      logger.info('Project update completed successfully', { projectId: id });
      return response;
    } catch (error) {
      logger.error(`Failed to update project with ID: ${id}`, error as Error, { projectId: id });
      throw error;
    }
  }

  /**
   * 删除项目
   */
  async deleteProject(id: string): Promise<void> {
    try {
      logger.info('Starting project deletion', { projectId: id });

      const project = await Project.findByPk(id);
      if (!project) {
        const error = new Error(`Project with ID ${id} not found`);
        logger.error('Project not found for deletion', error, { projectId: id });
        throw error;
      }

      // 先删除项目成员关联（外键约束可能需要）
      await ProjectAgent.destroy({
        where: { project_id: id }
      });

      await project.destroy();
      logger.info('Project deleted successfully', { projectId: id });
    } catch (error) {
      logger.error(`Failed to delete project with ID: ${id}`, error as Error, { projectId: id });
      throw error;
    }
  }

  /**
   * 归档项目（将状态改为archived）
   */
  async archiveProject(id: string): Promise<void> {
    try {
      logger.info('Starting project archiving', { projectId: id });

      const project = await Project.findByPk(id);
      if (!project) {
        const error = new Error(`Project with ID ${id} not found`);
        logger.error('Project not found for archiving', error, { projectId: id });
        throw error;
      }

      await project.update({ status: 'archived' });
      logger.info('Project archived successfully', { projectId: id });
    } catch (error) {
      logger.error(`Failed to archive project with ID: ${id}`, error as Error, { projectId: id });
      throw error;
    }
  }
}
