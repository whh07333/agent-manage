export interface Project {
  id: string;
  name: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'archived';
  managerId: string;
  managerName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  managerId: string;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  status?: 'active' | 'archived';
}
