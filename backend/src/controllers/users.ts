import { Request, Response } from 'express';
import { UserService } from '../services/users';
import { generateToken } from '../utils/jwt';

const userService = new UserService();

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userService.login(email, password);
    
    if (!user) {
      return res.status(401).json({
        code: 401,
        msg: 'Invalid email or password',
        data: null,
        trace_id: req.headers['x-request-id'] || 'default'
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      code: 0,
      msg: 'Login successful',
      data: {
        user,
        token
      },
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

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;
    const user = await userService.register({
      email,
      password,
      name,
      role: role || 'user'
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      code: 0,
      msg: 'Registration successful',
      data: {
        user,
        token
      },
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

export const getUserProfile = async (req: any, res: Response) => {
  try {
    const user = await userService.getUserById(req.user.id);
    res.json({
      code: 0,
      msg: 'Success',
      data: user,
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

export const updateUserProfile = async (req: any, res: Response) => {
  try {
    const user = await userService.updateUserProfile(
      req.user.id, 
      req.body
    );
    res.json({
      code: 0,
      msg: 'Profile updated successfully',
      data: user,
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

export const getUsers = async (req: any, res: Response) => {
  try {
    const users = await userService.getUsers();
    res.json({
      code: 0,
      msg: 'Success',
      data: users,
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
