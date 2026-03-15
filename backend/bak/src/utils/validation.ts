/**
 * 验证工具函数
 */

/**
 * 验证项目创建请求
 */
export const validateCreateProject = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // 验证必需字段
  if (!data.name || !data.name.trim()) {
    errors.push('Project name is required');
  } else if (data.name.length < 2 || data.name.length > 255) {
    errors.push('Project name must be between 2 and 255 characters');
  }

  if (!data.manager_id || !data.manager_id.trim()) {
    errors.push('Manager ID is required');
  }

  // 验证优先级
  if (data.priority && !['P0', 'P1', 'P2', 'P3'].includes(data.priority)) {
    errors.push('Priority must be one of: P0, P1, P2, P3');
  }

  // 验证状态
  if (data.status && !['active', 'inactive', 'archived'].includes(data.status)) {
    errors.push('Status must be one of: active, inactive, archived');
  }

  // 验证日期格式
  if (data.start_date) {
    const startDate = new Date(data.start_date);
    if (isNaN(startDate.getTime())) {
      errors.push('Start date must be a valid date');
    }
  }

  if (data.end_date) {
    const endDate = new Date(data.end_date);
    if (isNaN(endDate.getTime())) {
      errors.push('End date must be a valid date');
    }
  }

  // 验证start_date和end_date逻辑
  if (data.start_date && data.end_date) {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    if (startDate > endDate) {
      errors.push('Start date cannot be after end date');
    }
  }

  // 验证tags数组
  if (data.tags && !Array.isArray(data.tags)) {
    errors.push('Tags must be an array');
  }

  // 验证config对象
  if (data.config && (typeof data.config !== 'object' || Array.isArray(data.config))) {
    errors.push('Config must be an object');
  }

  // 验证agent_ids数组
  if (data.agent_ids && !Array.isArray(data.agent_ids)) {
    errors.push('Agent IDs must be an array');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * 验证项目更新请求
 */
export const validateUpdateProject = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // 验证name长度
  if (data.name !== undefined) {
    if (!data.name.trim()) {
      errors.push('Project name cannot be empty');
    } else if (data.name.length < 2 || data.name.length > 255) {
      errors.push('Project name must be between 2 and 255 characters');
    }
  }

  // 验证优先级
  if (data.priority && !['P0', 'P1', 'P2', 'P3'].includes(data.priority)) {
    errors.push('Priority must be one of: P0, P1, P2, P3');
  }

  // 验证状态
  if (data.status && !['active', 'inactive', 'archived'].includes(data.status)) {
    errors.push('Status must be one of: active, inactive, archived');
  }

  // 验证日期格式
  if (data.start_date) {
    const startDate = new Date(data.start_date);
    if (isNaN(startDate.getTime())) {
      errors.push('Start date must be a valid date');
    }
  }

  if (data.end_date) {
    const endDate = new Date(data.end_date);
    if (isNaN(endDate.getTime())) {
      errors.push('End date must be a valid date');
    }
  }

  // 验证start_date和end_date逻辑（如果两者都存在）
  if (data.start_date && data.end_date) {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    if (startDate > endDate) {
      errors.push('Start date cannot be after end date');
    }
  }

  // 验证tags数组
  if (data.tags !== undefined && !Array.isArray(data.tags)) {
    errors.push('Tags must be an array');
  }

  // 验证config对象
  if (data.config !== undefined && (typeof data.config !== 'object' || Array.isArray(data.config))) {
    errors.push('Config must be an object');
  }

  // 验证agent_ids数组
  if (data.agent_ids !== undefined && !Array.isArray(data.agent_ids)) {
    errors.push('Agent IDs must be an array');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};