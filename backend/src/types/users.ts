export interface User {
  id: string;
  agent_id: string;
  name: string;
  email?: string;
  role: 'admin' | 'project_manager' | 'developer' | 'tester' | 'observer';
  created_at: Date;
  updated_at: Date;
}

export interface UserCreationAttributes {
  agent_id: string;
  name: string;
  email?: string;
  role?: 'admin' | 'project_manager' | 'developer' | 'tester' | 'observer';
}
