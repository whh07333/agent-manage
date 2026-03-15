import { Request, Response } from 'express';
import { ProjectService } from '../services/projects';
import { CreateProjectRequest } from '../types/project';
import { validateCreateProject, validateUpdateProject } from '../utils/validation';
import { logger } from '../utils/logger';

const projectService = new ProjectService();

export const getAllProjects = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  try {
    logger.info('Fetching all projects', { requestId });
    const projects = await projectService.getAllProjects();
    logger.info(`Successfully fetched ${projects.length} projects`, { requestId, count: projects.length });
    res.json({
      code: 0,
      msg: 'Success',
      data: projects,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to fetch projects', error as Error, { requestId });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const projectId = req.params.id as string;
  try {
    logger.info('Fetching project by ID', { requestId, projectId });
    const project = await projectService.getProjectById(projectId);
    if (!project) {
      logger.warn(`Project not found with ID: ${projectId}`, { requestId, projectId });
      return res.status(404).json({
        code: 404,
        msg: 'Project not found',
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString()
      });
    }
    logger.info('Successfully fetched project', { requestId, projectId });
    res.json({
      code: 0,
      msg: 'Success',
      data: project,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Failed to fetch project with ID: ${projectId}`, error as Error, { requestId, projectId });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

export const createProject = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  try {
    logger.info('Creating new project', { requestId, body: req.body });

    // 验证请求数据
    const validation = validateCreateProject(req.body);
    if (!validation.valid) {
      logger.warn('Project creation validation failed', { requestId, errors: validation.errors });
      return res.status(400).json({
        code: 400,
        msg: validation.errors.join(', '),
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString()
      });
    }

    // 创建项目
    const project = await projectService.createProject(req.body as CreateProjectRequest);

    logger.info('Project created successfully', { requestId, projectId: project.id });
    res.status(201).json({
      code: 0,
      msg: 'Project created successfully',
      data: project,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // 根据错误类型返回不同的状态码
    let statusCode = 500;
    let errorMessage = 'Internal server error';

    if (error instanceof Error) {
      errorMessage = error.message;
      logger.error('Failed to create project', error, { requestId });

      // 根据错误消息设置不同的状态码
      if (error.message.includes('not found') || error.message.includes('not active')) {
        statusCode = 404;
      } else if (error.message.includes('validation')) {
        statusCode = 400;
      }
    }

    res.status(statusCode).json({
      code: statusCode,
      msg: errorMessage,
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const projectId = req.params.id as string;
  try {
    logger.info('Updating project', { requestId, projectId, body: req.body });

    // 验证请求数据
    const validation = validateUpdateProject(req.body);
    if (!validation.valid) {
      logger.warn('Project update validation failed', { requestId, projectId, errors: validation.errors });
      return res.status(400).json({
        code: 400,
        msg: validation.errors.join(', '),
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString()
      });
    }

    const project = await projectService.updateProject(projectId, req.body);

    if (!project) {
      logger.warn(`Project not found for update with ID: ${projectId}`, { requestId, projectId });
      return res.status(404).json({
        code: 404,
        msg: 'Project not found',
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString()
      });
    }

    logger.info('Project updated successfully', { requestId, projectId });
    res.json({
      code: 0,
      msg: 'Project updated successfully',
      data: project,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // 根据错误类型返回不同的状态码
    let statusCode = 500;
    let errorMessage = 'Internal server error';

    if (error instanceof Error) {
      errorMessage = error.message;
      logger.error(`Failed to update project with ID: ${projectId}`, error, { requestId, projectId });

      // 根据错误消息设置不同的状态码
      if (error.message.includes('not found') || error.message.includes('not active')) {
        statusCode = 404;
      } else if (error.message.includes('validation')) {
        statusCode = 400;
      }
    }

    res.status(statusCode).json({
      code: statusCode,
      msg: errorMessage,
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const projectId = req.params.id as string;
  try {
    logger.info('Deleting project', { requestId, projectId });
    await projectService.deleteProject(projectId);
    logger.info('Project deleted successfully', { requestId, projectId });
    res.json({
      code: 0,
      msg: 'Project deleted successfully',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // 根据错误类型返回不同的状态码
    let statusCode = 500;
    let errorMessage = 'Internal server error';

    if (error instanceof Error) {
      errorMessage = error.message;
      logger.error(`Failed to delete project with ID: ${projectId}`, error, { requestId, projectId });

      // 根据错误消息设置不同的状态码
      if (error.message.includes('not found')) {
        statusCode = 404;
      }
    }

    res.status(statusCode).json({
      code: statusCode,
      msg: errorMessage,
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

export const archiveProject = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const projectId = req.params.id as string;
  try {
    logger.info('Archiving project', { requestId, projectId });
    await projectService.archiveProject(projectId);
    logger.info('Project archived successfully', { requestId, projectId });
    res.json({
      code: 0,
      msg: 'Project archived successfully',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // 根据错误类型返回不同的状态码
    let statusCode = 500;
    let errorMessage = 'Internal server error';

    if (error instanceof Error) {
      errorMessage = error.message;
      logger.error(`Failed to archive project with ID: ${projectId}`, error, { requestId, projectId });

      // 根据错误消息设置不同的状态码
      if (error.message.includes('not found')) {
        statusCode = 404;
      }
    }

    res.status(statusCode).json({
      code: statusCode,
      msg: errorMessage,
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};
