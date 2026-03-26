export interface Task {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  assigneeId?: string;
  parentId?: string | null;
  status: string;
  priority: string;
  statusRemark?: string;
  dueDate?: Date | null;
  deliverables?: any[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskRequest {
  projectId: string;
  name: string;
  description?: string;
  assigneeId?: string;
  parentId?: string | null;
  status?: string;
  priority?: string;
  dueDate?: Date;
}

export interface UpdateTaskRequest {
  name?: string;
  description?: string;
  assigneeId?: string;
  parentId?: string | null;
  status?: string;
  priority?: string;
  dueDate?: Date;
}

export interface AcceptTaskRequest {
  assigneeId: string;
}

export interface AcceptanceTaskRequest {
  result: 'approved' | 'rejected';
  comment?: string;
}

export interface BlockTaskRequest {
  blockReason: string;
  relatedTasks?: string[];
}

export interface UnblockTaskRequest {
  comment?: string;
}

export interface TaskStatistics {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  blocked: number;
  cancelled: number;
}
