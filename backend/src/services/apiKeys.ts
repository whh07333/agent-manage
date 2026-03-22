import bcrypt from 'bcrypt';
import { ApiKey } from '../models/ApiKey';
import { User } from '../models/User';
import { randomBytes } from 'crypto';

export class ApiKeyService {
  /**
   * List all API keys for an agent
   */
  async listApiKeys(agentId: string): Promise<ApiKey[]> {
    return ApiKey.findAll({
      where: { agentId: agentId },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'agentId', 'name', 'createdAt', 'expiresAt', 'revokedAt', 'status', 'isActive']
    });
  }

  /**
   * Create a new API key
   * Returns the plain text key only once at creation
   */
  async createApiKey(
    agentId: string,
    name: string,
    createdBy: string,
    expiresInDays: number = 90
  ): Promise<{ api_key: string; api_key_record: ApiKey }> {
    // Verify that agentId exists in users table
    const agent = await User.findByPk(agentId);
    if (!agent) {
      throw new Error(`Agent with id ${agentId} does not exist`);
    }

    // Generate random API key
    const plainKey = `ak_${randomBytes(32).toString('hex')}`;
    const keyPrefix = plainKey.substring(0, 8);
    
    // Hash the key for storage
    const salt = bcrypt.genSaltSync(10);
    const keyHash = bcrypt.hashSync(plainKey, salt);

    // Calculate expiration
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + expiresInDays * 24 * 60 * 60 * 1000);

    // Create record
    const apiKeyRecord = await ApiKey.create({
      agentId: agentId,
      name: name,
      keyPrefix: keyPrefix,
      keyHash: keyHash,
      expiresAt: expiresAt,
      revokedAt: null,
      createdBy: createdBy,
      status: 'active',
      isActive: true
    });

    return {
      api_key: plainKey,
      api_key_record: apiKeyRecord
    };
  }

  /**
   * Revoke an API key (soft delete)
   */
  async revokeApiKey(id: string): Promise<ApiKey | null> {
    const apiKey = await ApiKey.findByPk(id);
    if (!apiKey) {
      return null;
    }
    await apiKey.update({
      status: 'revoked',
      revokedAt: new Date(),
      isActive: false
    });
    return apiKey;
  }

  /**
   * Delete an API key permanently (hard delete)
   */
  async deleteApiKey(id: string): Promise<boolean> {
    const apiKey = await ApiKey.findByPk(id);
    if (!apiKey) {
      return false;
    }
    await apiKey.destroy();
    return true;
  }

  /**
   * Rotate an API key - create new key, revoke old one
   */
  async rotateApiKey(
    oldId: string,
    name: string | undefined,
    expiresInDays: number = 90
  ): Promise<{ new_api_key: string; new_api_key_record: ApiKey }> {
    // Get old key
    const oldKey = await ApiKey.findByPk(oldId);
    if (!oldKey) {
      throw new Error('Old API key not found');
    }

    // Revoke old key
    await oldKey.update({
      status: 'revoked',
      revokedAt: new Date(),
      isActive: false
    });

    // Use existing name if not provided
    const newName = name || oldKey.name;

    // Create new key with same agentId, createdBy is the same user
    const result = await this.createApiKey(oldKey.agentId, newName, oldKey.createdBy, expiresInDays);
    return {
      new_api_key: result.api_key,
      new_api_key_record: result.api_key_record
    };
  }

  /**
   * Verify an API key
   * @returns agentId if valid, null if invalid
   */
  async verifyApiKey(plainKey: string): Promise<string | null> {
    // Verify by hashing and comparing
    const apiKeys = await ApiKey.findAll({ where: { isActive: true } });
    
    for (const apiKey of apiKeys) {
      const match = bcrypt.compareSync(plainKey, apiKey.keyHash);
      if (match) {
        // Check if expired
        if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
          await apiKey.update({ isActive: false });
          return null;
        }
        // Check if revoked
        if (apiKey.revokedAt) {
          return null;
        }
        // Update last used time
        await apiKey.update({ lastUsedAt: new Date() });
        return apiKey.agentId;
      }
    }

    return null;
  }
}
