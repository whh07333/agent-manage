export interface ApiKey {
  id: string;
  agentId: string;
  keyPrefix: string;
  keyHash: string;
  name: string;
  status: 'active' | 'revoked';
  lastUsedAt?: Date | null;
  expiresAt?: Date | null;
  createdBy: string;
  isActive: boolean;
  revokedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApiKeyRequest {
  agentId: string;
  name: string;
  expiresAt?: Date;
}

export interface UpdateApiKeyRequest {
  name?: string;
  status?: 'active' | 'revoked';
}

export interface RevokeApiKeyRequest {
  keyId: string;
  reason?: string;
}
