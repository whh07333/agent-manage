export interface Task {
  id: string;
  title: string;
  description?: string;
  project_id: string;
  owner_agent_id: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'blocked' | 'pending_review' | 'approved' | 'rejected' | 'completed' | 'canceled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  project_id: string;
  owner_agent_id: string;
  status?: 'pending' | 'assigned' | 'in_progress' | 'blocked' | 'pending_review' | 'approved' | 'rejected' | 'completed' | 'canceled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: Date;
}

export interface UpdateTaskStatusRequest {
  status: 'pending' | 'assigned' | 'in_progress' | 'blocked' | 'pending_review' | 'approved' | 'rejected' | 'completed' | 'canceled';
}
