import express from 'express';
import {
  listApiKeys,
  createApiKey,
  revokeApiKey,
  rotateApiKey,
  deleteApiKey
} from '../controllers/apiKeys';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

// All routes require admin authentication
router.get('/agent/:agentId', authMiddleware, adminMiddleware, listApiKeys);
router.post('/', authMiddleware, adminMiddleware, createApiKey);
router.post('/:id/revoke', authMiddleware, adminMiddleware, revokeApiKey);
router.post('/:id/rotate', authMiddleware, adminMiddleware, rotateApiKey);
router.delete('/:id', authMiddleware, adminMiddleware, deleteApiKey);

export default router;
