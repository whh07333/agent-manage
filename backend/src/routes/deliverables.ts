import { Router } from 'express';
import {
  getAllDeliverables,
  getDeliverableById,
  getDeliverablesByTaskId,
  createDeliverable,
  updateDeliverable,
  deleteDeliverable,
  restoreDeliverable
} from '../controllers/deliverables';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 所有路由都需要身份验证
router.use(authMiddleware);

router.get('/', getAllDeliverables);
router.get('/:id', getDeliverableById);
router.get('/task/:taskId', getDeliverablesByTaskId);
router.post('/', createDeliverable);
router.put('/:id', updateDeliverable);
router.delete('/:id', deleteDeliverable);
router.put('/:id/restore', restoreDeliverable);

export default router;
