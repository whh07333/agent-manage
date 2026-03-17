export interface Task {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  assignee_id: string;
  predecessor_task_id?: string | null;
  status: string;
  priority: string;
  due_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTaskRequest {
  project_id: string;
  name: string;
  description?: string;
  assignee_id: string;
  predecessor_task_id?: string | null;
  status?: string;
  priority?: string;
  due_date?: Date;
}

export interface UpdateTaskRequest {
  name?: string;
  description?: string;
  assignee_id?: string;
  predecessor_task_id?: string | null;
  status?: string;
  priority?: string;
  due_date?: Date;
}
