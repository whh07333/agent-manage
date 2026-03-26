export interface DeadLetterEvent {
  id: string;
  subscriptionId: string;
  eventType: string;
  eventPayload: Record<string, any>;
  retryCount: number;
  lastError?: string | null;
  lastFailedAt?: Date | null;
  retryScheduledAt?: Date | null;
  expireAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RetryDeadLetterRequest {
  eventId: string;
}

export interface BatchRetryDeadLetterRequest {
  eventIds: string[];
}
