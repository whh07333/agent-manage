import { Request, Response } from 'express';
import { ProjectService } from '../services/projects';
import { UpdateProjectRequest } from '../types/project';
import { logger } from '../utils/logger';
import { validateCreateProject, validateUpdateProject } from '../utils/validation';

const projectService = new ProjectService();

/**
 * Get all projects
 */
export const getAllProjects = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  try {
    logger.info('Getting all projects', { requestId });
    const projects = await projectService.getAllProjects();
    logger.info('All projects retrieved', { requestId, count: projects.length });
    res.json({
      code: 0,
      msg: 'success',
      data: projects,
      trace_id: requestId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get all projects', error as Error, { requestId });
    res.status(500).json({
      code: 500,
      msg: (error instanceof Error) ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Get project by ID
 */
export const getProjectById = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const { id } = req.params;
  try {
    logger.info('Getting project by id', { requestId, projectId: id });
    const project = await projectService.getProjectById(id);
    if (!project) {
      logger.warn('Project not found', { requestId, projectId: id });
      return res.status(404).json({
        code: 404,
        msg: 'Project not found',
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString(),
      });
    }
    logger.info('Project retrieved', { requestId, projectId: id });
    res.json({
      code: 0,
      msg: 'success',
      data: project,
      trace_id: requestId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get project', error as Error, { requestId, projectId: id });
    res.status(500).json({
      code: 500,
      msg: (error instanceof Error) ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Create new project
 */
export const createProject = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const body = req.body;
  try {
    logger.info('Creating new project', { requestId, name: body.name });
    
    // Validate input and escape HTML to prevent XSS
    const validation = validateCreateProject(body);
    if (!validation.valid) {
      logger.warn('Project creation validation failed', { requestId, message: validation.message });
      return res.status(400).json({
        code: 400,
        msg: validation.message,
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString(),
      });
    }
    
    const project = await projectService.createProject(validation.escapedData!);
    logger.info('Project created', { requestId, projectId: project.id });
    res.status(201).json({
      code: 0,
      msg: 'Project created successfully',
      data: project,
      trace_id: requestId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to create project', error as Error, { requestId });
    res.status(500).json({
      code: 500,
      msg: (error instanceof Error) ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Update project
 */
export const updateProject = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const { id } = req.params;
  const body = req.body as UpdateProjectRequest;

  try {
    logger.info('Updating project', { requestId, projectId: id });
    // Check if project exists - allow admins to update archived projects
    const existing = await projectService.getProjectById(id);
    if (!existing) {
      logger.warn('Project not found for update', { requestId, projectId: id });
      return res.status(404).json({
        code: 404,
        msg: 'Project not found',
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString(),
      });
    }

    // Allow update even if archived - only admins or the manager can update anyway due to permission check
    if (existing.dataValues.status === 'archived' && !((req as any).user.role === 'admin')) {
      logger.warn('Cannot modify archived project', { requestId, projectId: id });
      return res.status(400).json({
        code: 400,
        msg: 'Cannot modify archived project, please unarchive first',
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString(),
      });
    }

    // Validate input and escape HTML to prevent XSS
    const validation = validateUpdateProject(body);
    if (!validation.valid) {
      logger.warn('Project update validation failed', { requestId, message: validation.message });
      return res.status(400).json({
        code: 400,
        msg: validation.message,
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString(),
      });
    }

    const project = await projectService.updateProject(id, validation.escapedData!);
    if (!project) {
      logger.warn('Project not found for update', { requestId, projectId: id });
      return res.status(404).json({
        code: 404,
        msg: 'Project not found',
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString(),
      });
    }
    logger.info('Project updated successfully', { requestId, projectId: id });
    res.json({
      code: 0,
      msg: 'Project updated successfully',
      data: project,
      trace_id: requestId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to update project', error as Error, { requestId, projectId: id });
    res.status(500).json({
      code: 500,
      msg: (error instanceof Error) ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Delete (archive) project - soft delete
 * Only project manager or admin can do this
 */
export const deleteProject = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const { id } = req.params;
  const userId = (req as any).user?.id;
  const userRole = (req as any).user?.role;

  try {
    logger.info('Archiving project', { requestId, projectId: id });

    // Permission check: current user is manager OR admin
    const project = await projectService.getProjectById(id);
    if (!project) {
      logger.warn('Project not found for deletion', { requestId, projectId: id });
      return res.status(404).json({
        code: 404,
        msg: 'Project not found',
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString(),
      });
    }

    // Check permission: current user is the project manager OR admin
    if (project.managerId !== userId && userRole !== 'admin') {
      logger.warn('Permission denied: cannot archive project', { requestId, projectId: id, userId });
      return res.status(403).json({
        code: 403,
        msg: 'Permission denied. Only project manager or admin can archive projects',
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString(),
      });
    }

    // Escape archiveNote if provided
    let archiveNote = (req.body as any).archiveNote || null;
    if (archiveNote && typeof archiveNote === 'string') {
      const { escapeHtml } = await import('../utils/validation');
      archiveNote = escapeHtml(archiveNote);
    }

    const success = await projectService.archiveProject(id, userId, archiveNote);
    logger.info('Project archived successfully', { requestId, projectId: id });
    res.json({
      code: 0,
      msg: 'Project archived successfully',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to archive project', error as Error, { requestId });
    res.status(500).json({
      code: 500,
      msg: (error instanceof Error) ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString(),
    });
  }
};

export const archiveProject = async (req: Request, res: Response) => {
  return deleteProject(req, res);
};

/**
 * Unarchive project
 * Only project manager or admin can do this
 */
export const unarchiveProject = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const { id } = req.params;
  const userId = (req as any).user?.id;
  const userRole = (req as any).user?.role;

  try {
    logger.info('Unarchiving project', { requestId, projectId: id });

    // Permission check: current user is project manager OR admin
    const project = await projectService.getProjectById(id);
    if (!project) {
      logger.warn('Project not found for unarchive', { requestId, projectId: id });
      return res.status(404).json({
        code: 404,
        msg: 'Project not found',
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString(),
      });
    }

    // Check permission: current user is project manager OR admin
    if (project.managerId !== userId && userRole !== 'admin') {
      logger.warn('Permission denied: cannot unarchive project', { requestId, projectId: id, userId });
      return res.status(403).json({
        code: 403,
        msg: 'Permission denied. Only project manager or admin can unarchive projects',
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString(),
      });
    }

    const success = await projectService.unarchiveProject(id);
    logger.info('Project unarchived successfully', { requestId, projectId: id });
    res.json({
      code: 0,
      msg: 'Project unarchived successfully',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to unarchive project', error as Error, { requestId });
    res.status(500).json({
      code: 500,
      msg: (error instanceof Error) ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Get projects by manager id
 */
export const getProjectsByManager = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const { managerId } = req.params;
  try {
    logger.info('Fetching projects by manager', { requestId, managerId });
    const projects = await projectService.getProjectsByManager(managerId);
    logger.info('Successfully fetched projects by manager', { requestId, managerId, count: projects.length });
    res.json({
      code: 0,
      msg: 'Success',
      data: projects,
      trace_id: requestId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to fetch projects by manager', error as Error, { requestId });
    res.status(500).json({
      code: 500,
      msg: (error instanceof Error) ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString(),
    });
  }
};

export default {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  archiveProject,
  unarchiveProject,
  getProjectsByManager,
};
