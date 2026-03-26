export interface AuditLog {
  id: string;
  projectId?: string | null;
  userId?: string | null;
  action: string;
  resourceType: string;
  resourceId: string;
  content?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

export interface CreateAuditLogRequest {
  projectId?: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  content?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface QueryAuditLogsOptions {
  projectId?: string;
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}
