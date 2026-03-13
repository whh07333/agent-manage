import { Router } from 'express';
import {
  getAllAuditLogs,
  getAuditLogById,
  getAuditLogsByActor,
  getAuditLogsByTarget,
  getAuditLogsByAction,
  getAuditLogsByTimeRange,
  searchAuditLogs
} from '../controllers/auditLogs';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 所有路由都需要身份验证
router.use(authMiddleware);

router.get('/', getAllAuditLogs);
router.get('/:id', getAuditLogById);
router.get('/actor/:actorId', getAuditLogsByActor);
router.get('/target/:targetType', getAuditLogsByTarget);
router.get('/action/:action', getAuditLogsByAction);
router.get('/time-range', getAuditLogsByTimeRange);
router.get('/search', searchAuditLogs);

export default router;
