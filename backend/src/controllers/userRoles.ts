import { Request, Response } from 'express';
import { UserRoleService } from '../services/userRoles';

const userRoleService = new UserRoleService();

export const getAllUserRoles = async (req: Request, res: Response) => {
  try {
    const userRoles = await userRoleService.getAllUserRoles();
    res.json({
      code: 0,
      msg: 'Success',
      data: userRoles,
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

export const getUserRoleById = async (req: Request, res: Response) => {
  try {
    const userRole = await userRoleService.getUserRoleById(req.params.id);
    if (!userRole) {
      return res.status(404).json({
        code: 404,
        msg: 'User role not found',
        data: null,
        trace_id: req.headers['x-request-id'] || 'default'
      });
    }
    res.json({
      code: 0,
      msg: 'Success',
      data: userRole,
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

export const getUserRolesByUserId = async (req: Request, res: Response) => {
  try {
    const userRoles = await userRoleService.getUserRolesByUserId(req.params.userId);
    res.json({
      code: 0,
      msg: 'Success',
      data: userRoles,
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

export const getUserRolesByRoleId = async (req: Request, res: Response) => {
  try {
    const userRoles = await userRoleService.getUserRolesByRoleId(req.params.roleId);
    res.json({
      code: 0,
      msg: 'Success',
      data: userRoles,
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

export const getUserRolesByProjectId = async (req: Request, res: Response) => {
  try {
    const userRoles = await userRoleService.getUserRolesByProjectId(req.params.projectId);
    res.json({
      code: 0,
      msg: 'Success',
      data: userRoles,
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

export const getUserRolesByUserIdAndProjectId = async (req: Request, res: Response) => {
  try {
    const userRoles = await userRoleService.getUserRolesByUserIdAndProjectId(
      req.params.userId,
      req.params.projectId
    );
    res.json({
      code: 0,
      msg: 'Success',
      data: userRoles,
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

export const createUserRole = async (req: Request, res: Response) => {
  try {
    const userRole = await userRoleService.createUserRole(req.body);
    res.status(201).json({
      code: 0,
      msg: 'User role created successfully',
      data: userRole,
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

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const userRole = await userRoleService.updateUserRole(req.params.id, req.body);
    if (!userRole) {
      return res.status(404).json({
        code: 404,
        msg: 'User role not found',
        data: null,
        trace_id: req.headers['x-request-id'] || 'default'
      });
    }
    res.json({
      code: 0,
      msg: 'User role updated successfully',
      data: userRole,
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

export const deleteUserRole = async (req: Request, res: Response) => {
  try {
    await userRoleService.deleteUserRole(req.params.id);
    res.json({
      code: 0,
      msg: 'User role deleted successfully',
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

export const deleteUserRolesByUserId = async (req: Request, res: Response) => {
  try {
    await userRoleService.deleteUserRolesByUserId(req.params.userId);
    res.json({
      code: 0,
      msg: 'User roles deleted successfully',
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

export const deleteUserRolesByProjectId = async (req: Request, res: Response) => {
  try {
    await userRoleService.deleteUserRolesByProjectId(req.params.projectId);
    res.json({
      code: 0,
      msg: 'User roles deleted successfully',
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
