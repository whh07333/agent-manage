export interface BlockRecord {
  id: string;
  taskId: string;
  blockReason: string;
  relatedTasks: string[];
  blockedBy: string;
  blockedAt: Date;
  resolvedAt?: Date | null;
  resolvedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBlockRecordRequest {
  taskId: string;
  blockReason: string;
  relatedTasks?: string[];
}

export interface ResolveBlockRecordRequest {
  comment?: string;
}
