/**
 * 项目创建请求接口
 */
export interface CreateProjectRequest {
  name: string;
  description?: string;
  manager_id: string;
  priority?: 'P0' | 'P1' | 'P2' | 'P3';
  status?: 'active' | 'inactive' | 'archived';
  start_date?: Date | string;
  end_date?: Date | string;
  tags?: string[];
  config?: Record<string, any>;
  agent_ids?: string[]; // 项目成员Agent IDs，不直接存储，通过project_agents关联
}

/**
 * 项目更新请求接口
 */
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  manager_id?: string;
  priority?: 'P0' | 'P1' | 'P2' | 'P3';
  status?: 'active' | 'inactive' | 'archived';
  start_date?: Date | string;
  end_date?: Date | string;
  tags?: string[];
  config?: Record<string, any>;
  agent_ids?: string[]; // 项目成员Agent IDs，不直接存储，通过project_agents关联
}

/**
 * 项目响应接口
 */
export interface ProjectResponse {
  id: string;
  name: string;
  description: string | null;
  manager_id: string;
  priority: string;
  status: string;
  start_date: Date | null;
  end_date: Date | null;
  tags: string[] | null;
  config: Record<string, any> | null;
  agent_ids: string[]; // 项目成员Agent IDs
  created_at: Date;
  updated_at: Date;
}

/**
 * API响应格式
 */
export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T | null;
  trace_id: string;
  timestamp?: string;
}