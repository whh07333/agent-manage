export interface Subscription {
  id: string;
  agentId: string;
  agentType: string;
  targetId?: string | null;
  eventType: string;
  callbackUrl: string;
  secret?: string | null;
  isActive: boolean;
  maxRetries: number;
  retryCount: number;
  lastFailedAt?: Date | null;
  retryScheduledAt?: Date | null;
  expireAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionRequest {
  agentId: string;
  agentType: string;
  targetId?: string | null;
  eventType: string;
  callbackUrl: string;
  secret?: string;
  maxRetries?: number;
}

export interface UpdateSubscriptionRequest {
  callbackUrl?: string;
  secret?: string;
  isActive?: boolean;
  maxRetries?: number;
}

export interface RetrySubscriptionRequest {
  subscriptionId: string;
}
