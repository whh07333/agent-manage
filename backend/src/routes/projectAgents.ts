import { Router } from 'express';
import {
  getAllProjectAgents,
  getProjectAgentById,
  getProjectAgentsByProjectId,
  getProjectAgentsByAgentId,
  createProjectAgent,
  updateProjectAgent,
  deleteProjectAgent,
  restoreProjectAgent,
  deleteProjectAgentsByProjectId,
  deleteProjectAgentsByAgentId
} from '../controllers/projectAgents';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 所有路由都需要身份验证
router.use(authMiddleware);

router.get('/', getAllProjectAgents);
router.get('/:id', getProjectAgentById);
router.get('/project/:projectId', getProjectAgentsByProjectId);
router.get('/agent/:agentId', getProjectAgentsByAgentId);
router.post('/', createProjectAgent);
router.put('/:id', updateProjectAgent);
router.delete('/:id', deleteProjectAgent);
router.put('/:id/restore', restoreProjectAgent);
router.delete('/project/:projectId', deleteProjectAgentsByProjectId);
router.delete('/agent/:agentId', deleteProjectAgentsByAgentId);

export default router;
