import { Router } from 'express';
import {
  getAllSubscriptions,
  getSubscriptionById,
  getSubscriptionsByAgentId,
  getSubscriptionsByTargetId,
  getSubscriptionsByEventType,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  pauseSubscription,
  resumeSubscription
} from '../controllers/subscriptions';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 所有路由都需要身份验证
router.use(authMiddleware);

router.get('/', getAllSubscriptions);
router.get('/:id', getSubscriptionById);
router.get('/agent/:agentId', getSubscriptionsByAgentId);
router.get('/target/:targetId', getSubscriptionsByTargetId);
router.get('/event/:eventType', getSubscriptionsByEventType);
router.post('/', createSubscription);
router.put('/:id', updateSubscription);
router.delete('/:id', deleteSubscription);
router.put('/:id/pause', pauseSubscription);
router.put('/:id/resume', resumeSubscription);

export default router;
