/**
 * Escape HTML special characters to prevent XSS attacks
 * Converts < > " ' & to corresponding HTML entities
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') {
    return str;
  }
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Recursively escape all string properties in an object
 * This handles nested objects and arrays
 */
export function escapeAllStrings(obj: any): any {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      return escapeHtml(obj);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => escapeAllStrings(item));
  }

  const escaped: any = {};
  for (const [key, value] of Object.entries(obj)) {
    escaped[key] = escapeAllStrings(value);
  }
  return escaped;
}

/**
 * Validate project creation data
 */
export function validateCreateProject(data: any): { valid: boolean; message?: string; escapedData?: any } {
  // 验证名称（同时支持驼峰和下划线命名）
  const name = data.name || data.name;
  if (!name || typeof name !== 'string' || name.length < 2 || name.length > 100) {
    return { valid: false, message: 'Project name must be between 2 and 100 characters' };
  }

  // 验证描述（同时支持驼峰和下划线命名）
  const description = data.description !== undefined ? data.description : (data.description !== undefined ? data.description : undefined);
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string' || description.length > 1000) {
      return { valid: false, message: 'Project description must not exceed 1000 characters' };
    }
  }

  // 验证managerId - 创建时必填
  const managerId = data.managerId || data.managerId;
  if (!managerId || typeof managerId !== 'string') {
    return { valid: false, message: 'managerId is required and must be a string' };
  }

  // 验证优先级
  const priority = data.priority || data.priority;
  if (priority !== undefined && !['low', 'medium', 'high'].includes(priority)) {
    return { valid: false, message: 'Priority must be one of: low, medium, high' };
  }

  // 验证状态
  const status = data.status || data.status;
  if (status !== undefined && !['active', 'inactive', 'archived'].includes(status)) {
    return { valid: false, message: 'Status must be one of: active, inactive, archived' };
  }

  // 验证截止日期（同时支持驼峰和下划线命名）
  const dueDateStr = data.dueDate || data.due_date;
  if (dueDateStr) {
    const dueDate = new Date(dueDateStr);
    if (isNaN(dueDate.getTime())) {
      return { valid: false, message: 'Invalid due date format' };
    }
  }

  // 验证开始日期和结束日期（同时支持驼峰和下划线命名）
  const startDateStr = data.startDate || data.start_date;
  const endDateStr = data.endDate || data.end_date;
  if (startDateStr && endDateStr) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    if (isNaN(startDate.getTime())) {
      return { valid: false, message: 'Invalid start date format' };
    }
    if (isNaN(endDate.getTime())) {
      return { valid: false, message: 'Invalid end date format' };
    }
    if (startDate.getTime() > endDate.getTime()) {
      return { valid: false, message: 'Start date must be before or equal to end date' };
    }
  }

  // 验证config字段JSON格式（新增）
  const config = data.config || data.config;
  if (config !== undefined && config !== null) {
    if (typeof config === 'string') {
      try {
        JSON.parse(config);
      } catch (e) {
        return { valid: false, message: 'Config field must be valid JSON format' };
      }
    } else if (typeof config !== 'object') {
      return { valid: false, message: 'Config field must be an object or valid JSON string' };
    }
  }

  // Escape all HTML special characters in string inputs
  const escapedData = escapeAllStrings(data);
  return { valid: true, escapedData };
}

/**
 * Validate project update data
 * For update: managerId is NOT required - it's an existing property that doesn't need to be sent on every update
 */
export function validateUpdateProject(data: any): { valid: boolean; message?: string; escapedData?: any } {
  return validateProjectData(data);
}

/**
 * Shared validation for project create/update
 * Only validate fields that are actually being updated
 */
export function validateProjectData(data: any): { valid: boolean; message?: string; escapedData?: any } {
  // 验证名称（同时支持驼峰和下划线命名）
  const name = data.name || data.name;
  if (name !== undefined && (!name || typeof name !== 'string' || name.length < 2 || name.length > 100)) {
    return { valid: false, message: 'Project name must be between 2 and 100 characters' };
  }

  // 验证描述（同时支持驼峰和下划线命名）
  const description = data.description !== undefined ? data.description : (data.description !== undefined ? data.description : undefined);
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string' || description.length > 1000) {
      return { valid: false, message: 'Project description must not exceed 1000 characters' };
    }
  }

  // managerId - only validate if it's being updated
  const managerId = data.managerId || data.managerId;
  if (managerId !== undefined && (typeof managerId !== 'string' || managerId.length === 0)) {
    return { valid: false, message: 'managerId must be a non-empty string' };
  }

  // 验证优先级
  const priority = data.priority || data.priority;
  if (priority !== undefined && !['low', 'medium', 'high'].includes(priority)) {
    return { valid: false, message: 'Priority must be one of: low, medium, high' };
  }

  // 验证状态
  const status = data.status || data.status;
  if (status !== undefined && !['active', 'inactive', 'archived'].includes(status)) {
    return { valid: false, message: 'Status must be one of: active, inactive, archived' };
  }

  // 验证截止日期（同时支持驼峰和下划线命名）
  const dueDateStr = data.dueDate || data.due_date;
  if (dueDateStr) {
    const dueDate = new Date(dueDateStr);
    if (isNaN(dueDate.getTime())) {
      return { valid: false, message: 'Invalid due date format' };
    }
  }

  // 验证开始日期和结束日期（同时支持驼峰和下划线命名）
  const startDateStr = data.startDate || data.start_date;
  const endDateStr = data.endDate || data.end_date;
  if (startDateStr && endDateStr) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    if (isNaN(startDate.getTime())) {
      return { valid: false, message: 'Invalid start date format' };
    }
    if (isNaN(endDate.getTime())) {
      return { valid: false, message: 'Invalid end date format' };
    }
    if (startDate.getTime() > endDate.getTime()) {
      return { valid: false, message: 'Start date must be before or equal to end date' };
    }
  }

  // 验证config字段JSON格式（新增）
  const config = data.config || data.config;
  if (config !== undefined && config !== null) {
    if (typeof config === 'string') {
      try {
        JSON.parse(config);
      } catch (e) {
        return { valid: false, message: 'Config field must be valid JSON format' };
      }
    } else if (typeof config !== 'object') {
      return { valid: false, message: 'Config field must be an object or valid JSON string' };
    }
  }

  // Escape all HTML special characters in string inputs
  const escapedData = escapeAllStrings(data);
  return { valid: true, escapedData };
}

/**
 * Validate task creation/update data
 */
export function validateTaskData(data: any): { valid: boolean; message?: string; escapedData?: any } {
  // 验证名称
  if (data.name !== undefined && (!data.name || typeof data.name !== 'string' || data.name.length < 2 || data.name.length > 255)) {
    return { valid: false, message: 'Task name must be between 2 and 255 characters' };
  }

  // 验证优先级
  if (data.priority !== undefined && !['low', 'medium', 'high'].includes(data.priority)) {
    return { valid: false, message: 'Priority must be one of: low, medium, high' };
  }

  // 验证状态
  if (data.status !== undefined && !['pending', 'in_progress', 'completed', 'blocked', 'cancelled'].includes(data.status)) {
    return { valid: false, message: 'Status must be one of: pending, in_progress, completed, blocked, cancelled' };
  }

  // 验证截止日期（同时支持驼峰和下划线命名）
  const dueDateStr = data.dueDate || data.due_date;
  if (dueDateStr) {
    const dueDate = new Date(dueDateStr);
    if (isNaN(dueDate.getTime())) {
      return { valid: false, message: 'Invalid due date format' };
    }
  }

  // 验证开始和结束日期 - 如果同时提供了开始和结束日期，开始必须早于或等于结束
  const startDateStr = data.startDate || data.start_date;
  const endDateStr = data.endDate || data.end_date;
  if (startDateStr && endDateStr) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    if (isNaN(startDate.getTime())) {
      return { valid: false, message: 'Invalid start date format' };
    }
    if (isNaN(endDate.getTime())) {
      return { valid: false, message: 'Invalid end date format' };
    }
    if (startDate.getTime() > endDate.getTime()) {
      return { valid: false, message: 'Start date must be before or equal to end date' };
    }
  }

  // Escape all HTML special characters in string inputs
  const escapedData = return { valid: true, escapedData: true };
}
