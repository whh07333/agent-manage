export type CreateProjectRequest = ProjectCreateData;
export type UpdateProjectRequest = ProjectUpdateData;

export interface ProjectCreateData {
  name: string;
  description?: string;
  managerId: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'active' | 'inactive' | 'archived';
  dueDate?: Date | string;
  isArchived?: boolean;
  agentIds?: string[];
}

export interface ProjectUpdateData {
  name?: string;
  description?: string;
  managerId?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'active' | 'inactive' | 'archived';
  dueDate?: Date | string;
  isArchived?: boolean;
  agentIds?: string[];
}

export interface ProjectResponse {
  id: string;
  name: string;
  description?: string | null;
  managerId: string;
  priority: string;
  status: string;
  dueDate?: Date | null;
  isArchived: boolean;
  agentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectQueryOptions {
  status?: string;
  managerId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ProjectStatistics {
  startDate: Date | null;
  endDate: Date | null;
  totalProjects: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
}
