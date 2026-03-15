export interface CreateProjectRequest {
  name: string;
  description?: string;
  manager_id: string;
  priority?: string;
  start_date?: Date;
  end_date?: Date;
  tags?: string[];
  config?: Record<string, any>;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  manager_id?: string;
  priority?: string;
  start_date?: Date;
  end_date?: Date;
  tags?: string[];
  config?: Record<string, any>;
}

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
  created_at: Date;
  updated_at: Date;
}
