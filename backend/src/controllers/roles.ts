import { Request, Response } from 'express';
import { RoleService } from '../services/roles';
import { escapeAllStrings } from '../utils/validation';

const roleService = new RoleService();

export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await roleService.getAllRoles();
    res.json({
      code: 0,
      msg: 'Success',
      data: roles,
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

export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await roleService.getRoleById(id);
    if (!role) {
      return res.status(404).json({
        code: 404,
        msg: 'Role not found',
        data: null,
        trace_id: req.headers['x-request-id'] || 'default'
      });
    }
    res.json({
      code: 0,
      msg: 'Success',
      data: role,
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

export const getRoleByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const role = await roleService.getRoleByName(name);
    if (!role) {
      return res.status(404).json({
        code: 404,
        msg: 'Role not found',
        data: null,
        trace_id: req.headers['x-request-id'] || 'default'
      });
    }
    res.json({
      code: 0,
      msg: 'Success',
      data: role,
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

export const getSystemRoles = async (req: Request, res: Response) => {
  try {
    const roles = await roleService.getSystemRoles();
    res.json({
      code: 0,
      msg: 'Success',
      data: roles,
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

export const getCustomRoles = async (req: Request, res: Response) => {
  try {
    const roles = await roleService.getCustomRoles();
    res.json({
      code: 0,
      msg: 'Success',
      data: roles,
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

export const createRole = async (req: Request, res: Response) => {
  try {
    // Escape all HTML special characters in string inputs
    const escapedData = escapeAllStrings(req.body);
    const { name, description, permissions, is_system } = escapedData;
    const role = await roleService.createRole({ name, description, permissions, is_system });
    res.status(201).json({
      code: 0,
      msg: 'Role created successfully',
      data: role,
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

export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Escape all HTML special characters in string inputs
    const escapedData = escapeAllStrings(req.body);
    const { name, description, permissions, is_system } = escapedData;
    const role = await roleService.updateRole(id, { name, description, permissions, is_system });
    if (!role) {
      return res.status(404).json({
        code: 404,
        msg: 'Role not found',
        data: null,
        trace_id: req.headers['x-request-id'] || 'default'
      });
    }
    res.json({
      code: 0,
      msg: 'Role updated successfully',
      data: role,
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

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await roleService.deleteRole(id);
    res.json({
      code: 0,
      msg: 'Role deleted successfully',
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

export const checkPermission = async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    const { permission } = req.query;
    
    if (!permission) {
      return res.status(400).json({
        code: 400,
        msg: 'Permission parameter is required',
        data: null,
        trace_id: req.headers['x-request-id'] || 'default'
      });
    }
    
    const role = await roleService.getRoleById(roleId);
    if (!role) {
      return res.status(404).json({
        code: 404,
        msg: 'Role not found',
        data: null,
        trace_id: req.headers['x-request-id'] || 'default'
      });
    }
    
    const hasPermission = await roleService.checkPermission(role.id, permission as string);
    res.json({
      code: 0,
      msg: 'Success',
      data: { id: roleId, hasPermission },
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
