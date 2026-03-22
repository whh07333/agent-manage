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
  resumeSubscription,
  getDeadLetters,
  retryDeadLetter,
  retryAllDeadLetters,
  deleteDeadLetter,
} from '../controllers/subscriptions';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// 所有路由都需要身份验证
router.use(authMiddleware);

router.get('/', getAllSubscriptions);
// 具体路由必须放在参数路由 :id 前面！否则 "dead-letters" 会被匹配为 id
// 死信管理接口需要管理员权限
router.get('/dead-letters', adminMiddleware, getDeadLetters);
router.post('/dead-letters/:id/retry', adminMiddleware, retryDeadLetter);
router.post('/dead-letters/retry-all', adminMiddleware, retryAllDeadLetters);
router.delete('/dead-letters/:id', adminMiddleware, deleteDeadLetter);
// 参数路由放在最后
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
