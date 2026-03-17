export interface Project {
  id: string;
  name: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'archived';
  manager_id: string;
  manager_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  manager_id: string;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  status?: 'active' | 'archived';
}
