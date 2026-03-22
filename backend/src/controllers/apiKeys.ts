import { Request, Response } from 'express';
import { ApiKey } from '../models/ApiKey';
import { ApiKeyService } from '../services/apiKeys';
import { logger } from '../utils/logger';
import { generateRandomString } from '../utils/randomString';
import { escapeHtml } from '../utils/validation';

const apiKeyService = new ApiKeyService();

/**
 * List all API keys for an agent
 * GET /api/api-keys/agent/:agentId
 */
export const listApiKeys = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const { agentId } = req.params;

  try {
    logger.info('Listing API keys', { requestId, agentId });
    const apiKeys = await apiKeyService.listApiKeys(agentId);
    logger.info('API keys listed', { requestId, agentId, count: apiKeys.length });
    res.json({
      code: 0,
      msg: 'success',
      data: apiKeys,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to list API keys', error as Error, { requestId, agentId });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Create a new API key
 * POST /api/api-keys/
 */
export const createApiKey = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  let { 
    agentId, 
    name, 
    expiresInDays 
  } = req.body;

  // Escape HTML special characters to prevent XSS
  if (name && typeof name === 'string') {
    name = escapeHtml(name);
  }

  const userId = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({
      code: 401,
      msg: 'Unauthorized: user id not found in token',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
    return;
  }

  try {
    if (!agentId || !name) {
      res.status(400).json({
        code: 400,
        msg: 'Missing required fields: agentId and name are required',
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString()
      });
      return;
    }

    logger.info('Creating new API key', { requestId, agentId, name, createdBy: userId });
    const result = await apiKeyService.createApiKey(agentId, name, userId, expiresInDays || 90);
    logger.info('API key created', { requestId, id: result.api_key_record.id, createdBy: userId });
    await addAuditLog(req, 'create', 'api_key', result.api_key_record.id);
    res.status(201).json({
      code: 0,
      msg: 'API key created successfully',
      data: {
        api_key: result.api_key,
        id: result.api_key_record.id,
        expiresAt: result.api_key_record.expiresAt
      },
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to create API key', error as Error, { requestId });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Revoke an API key (soft delete, keeps history)
 * POST /api/api-keys/:id/revoke
 */
export const revokeApiKey = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const { id } = req.params;

  try {
    logger.info('Revoking API key', { requestId, id });
    await apiKeyService.revokeApiKey(id);
    logger.info('API key revoked', { requestId, id });
    await addAuditLog(req, 'revoke', 'api_key', id);
    res.json({
      code: 0,
      msg: 'API key revoked successfully',
      data: { success: true },
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to revoke API key', error as Error, { requestId, id });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Delete an API key permanently (hard delete)
 * DELETE /api/api-keys/:id
 */
export const deleteApiKey = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const { id } = req.params;

  try {
    logger.info('Deleting API key', { requestId, id });
    const result = await apiKeyService.deleteApiKey(id);
    if (!result) {
      res.status(404).json({
        code: 404,
        msg: 'API key not found',
        data: null,
        trace_id: requestId,
        timestamp: new Date().toISOString()
      });
      return;
    }
    logger.info('API key deleted', { requestId, id });
    await addAuditLog(req, 'delete', 'api_key', id);
    res.json({
      code: 0,
      msg: 'API key deleted permanently',
      data: { success: true },
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to delete API key', error as Error, { requestId, id });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Rotate an API key - create new key, revoke old one
 * POST /api/api-keys/:id/rotate
 */
export const rotateApiKey = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const { id } = req.params;
  let { name, expiresInDays } = req.body;

  // Escape HTML special characters to prevent XSS
  if (name && typeof name === 'string') {
    name = escapeHtml(name);
  }

  try {
    logger.info('Rotating API key', { requestId, id });
    const result = await apiKeyService.rotateApiKey(id, name, expiresInDays || 90);
    // Add audit log
    await addAuditLog(req, 'rotate', 'api_key', id);

    logger.info('API key rotated', { requestId, id, new_id: result.new_api_key_record.id });
    res.json({
      code: 0,
      msg: 'API key rotated successfully. Old key will remain valid for 24 hours.',
      data: {
        api_key: result.new_api_key,
        id: result.new_api_key_record.id,
        expiresAt: result.new_api_key_record.expiresAt
      },
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to rotate API key', error as Error, { requestId, id });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

// Helper to add audit log
async function addAuditLog(
  req: Request,
  action: string,
  resourceType: string,
  resourceId: string
) {
  try {
    const pool = require('../config/database').default;
    const requestId = req.headers['x-request-id'] as string || 'default';
    const userId = (req as any).user?.id;
    const projectId = (req as any).params?.projectId;

    await pool.query(
      `INSERT INTO audit_logs (id, project_id, user_id, action, resource_type, resource_id, content, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        generateRandomString(32),
        projectId || null,
        userId || null,
        action,
        resourceType,
        resourceId,
        JSON.stringify({ timestamp: new Date().toISOString() }),
        req.ip || 'unknown',
        req.headers['user-agent'] || 'unknown'
      ]
    );
  } catch (error) {
    logger.error('Failed to add audit log', error as Error);
  }
}
