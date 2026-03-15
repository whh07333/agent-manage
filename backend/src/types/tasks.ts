export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'assigned' | 'in_progress' | 'blocked' | 'pending_review' | 'approved' | 'rejected' | 'canceled' | 'completed';
  owner_agent_id: string;
  project_id: string;
  due_date?: Date;
  deliverables?: Deliverable[];
  created_at: Date;
  updated_at: Date;
}

export interface Deliverable {
  id?: string;
  url: string;
  name: string;
  size: number;
  type: string;
  uploaded_at: Date;
}

export interface TaskCreationAttributes {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'assigned' | 'in_progress' | 'blocked' | 'pending_review' | 'approved' | 'rejected' | 'canceled' | 'completed';
  owner_agent_id: string;
  project_id: string;
  due_date?: Date;
}
