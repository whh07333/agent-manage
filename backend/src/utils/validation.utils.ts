import { TaskCreationAttributes } from '../types/tasks';

export const validateTaskData = (data: TaskCreationAttributes): string | null => {
  if (!data.title) {
    return 'Task title is required';
  }
  
  if (data.title.length < 2 || data.title.length > 255) {
    return 'Task title must be between 2 and 255 characters';
  }
  
  if (!data.owner_agent_id) {
    return 'Task owner agent ID is required';
  }
  
  if (!data.project_id) {
    return 'Task project ID is required';
  }
  
  if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
    return 'Task priority must be one of: low, medium, high';
  }
  
  if (data.due_date && new Date(data.due_date) < new Date()) {
    return 'Task due date must be in the future';
  }
  
  return null;
};

export const validateUserData = (data: any): string | null => {
  if (!data.agent_id) {
    return 'Agent ID is required';
  }
  
  if (!data.name || data.name.length < 2 || data.name.length > 255) {
    return 'User name must be between 2 and 255 characters';
  }
  
  if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
    return 'Invalid email format';
  }
  
  if (data.role && !['admin', 'project_manager', 'developer', 'tester', 'observer'].includes(data.role)) {
    return 'User role must be one of: admin, project_manager, developer, tester, observer';
  }
  
  return null;
};
