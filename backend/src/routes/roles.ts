import { Router } from 'express';
import {
  getAllRoles,
  getRoleById,
  getRoleByName,
  getSystemRoles,
  getCustomRoles,
  createRole,
  updateRole,
  deleteRole,
  checkPermission
} from '../controllers/roles';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 所有路由都需要身份验证
router.use(authMiddleware);

router.get('/', getAllRoles);
router.get('/:id', getRoleById);
router.get('/name/:name', getRoleByName);
router.get('/system', getSystemRoles);
router.get('/custom', getCustomRoles);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);
router.get('/:id/check-permission/:permission', checkPermission);

export default router;
