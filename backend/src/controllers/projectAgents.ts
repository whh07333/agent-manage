import { Request, Response } from 'express';
import { ProjectAgentService } from '../services/projectAgents';
import { escapeAllStrings } from '../utils/validation';

const projectAgentService = new ProjectAgentService();

export const getAllProjectAgents = async (req: Request, res: Response) => {
  try {
    const projectAgents = await projectAgentService.getAllProjectAgents();
    res.json({
      code: 0,
      msg: 'Success',
      data: projectAgents,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  }
};

export const getProjectAgentById = async (req: Request, res: Response) => {
  try {
    const projectAgent = await projectAgentService.getProjectAgentById(req.params.id as string);
    if (!projectAgent) {
      return res.status(404).json({
        code: 404,
        msg: 'Project agent not found',
        data: null,
        trace_id: req.headers['x-request-id'] || 'default'
      });
    }
    res.json({
      code: 0,
      msg: 'Success',
      data: projectAgent,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  }
};

export const getProjectAgentsByProjectId = async (req: Request, res: Response) => {
  try {
    const projectAgents = await projectAgentService.getProjectAgentsByProjectId(req.params.projectId as string);
    res.json({
      code: 0,
      msg: 'Success',
      data: projectAgents,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  }
};

export const getProjectAgentsByAgentId = async (req: Request, res: Response) => {
  try {
    const projectAgents = await projectAgentService.getProjectAgentsByAgentId(req.params.agentId as string);
    res.json({
      code: 0,
      msg: 'Success',
      data: projectAgents,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  }
};

export const createProjectAgent = async (req: Request, res: Response) => {
  try {
    // Escape all HTML special characters in string inputs
    const escapedData = escapeAllStrings(req.body);
    const projectAgent = await projectAgentService.createProjectAgent(escapedData);
    res.status(201).json({
      code: 0,
      msg: 'Project agent created successfully',
      data: projectAgent,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  }
};

export const updateProjectAgent = async (req: Request, res: Response) => {
  try {
    // Escape all HTML special characters in string inputs
    const escapedData = escapeAllStrings(req.body);
    const projectAgent = await projectAgentService.updateProjectAgent(req.params.id as string, escapedData);
    if (!projectAgent) {
      return res.status(404).json({
        code: 404,
        msg: 'Project agent not found',
        data: null,
        trace_id: req.headers['x-request-id'] || 'default'
      });
    }
    res.json({
      code: 0,
      msg: 'Project agent updated successfully',
      data: projectAgent,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  }
};

export const deleteProjectAgent = async (req: Request, res: Response) => {
  try {
    await projectAgentService.deleteProjectAgent(req.params.id as string);
    res.json({
      code: 0,
      msg: 'Project agent deleted successfully',
      data: null,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  }
};

export const restoreProjectAgent = async (req: Request, res: Response) => {
  try {
    await projectAgentService.restoreProjectAgent(req.params.id as string);
    res.json({
      code: 0,
      msg: 'Project agent restored successfully',
      data: null,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  }
};

export const deleteProjectAgentsByProjectId = async (req: Request, res: Response) => {
  try {
    await projectAgentService.deleteProjectAgentsByProjectId(req.params.projectId as string);
    res.json({
      code: 0,
      msg: 'Project agents deleted successfully',
      data: null,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  }
};

export const deleteProjectAgentsByAgentId = async (req: Request, res: Response) => {
  try {
    await projectAgentService.deleteProjectAgentsByAgentId(req.params.agentId as string);
    res.json({
      code: 0,
      msg: 'Project agents deleted successfully',
      data: null,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  }
};
