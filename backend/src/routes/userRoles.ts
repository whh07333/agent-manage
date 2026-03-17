import { Router } from 'express';
import {
  getAllUserRoles,
  getUserRoleById,
  getUserRolesByUserId,
  getUserRolesByRoleId,
  getUserRolesByProjectId,
  getUserRolesByUserIdAndProjectId,
  createUserRole,
  updateUserRole,
  deleteUserRole,
  deleteUserRolesByUserId,
  deleteUserRolesByProjectId
} from '../controllers/userRoles';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// 所有路由都需要身份验证
router.use(authMiddleware);

router.get('/', getAllUserRoles);
router.get('/:id', getUserRoleById);
router.get('/user/:userId', getUserRolesByUserId);
router.get('/role/:roleId', getUserRolesByRoleId);
router.get('/project/:projectId', getUserRolesByProjectId);
router.get('/user/:userId/project/:projectId', getUserRolesByUserIdAndProjectId);
router.post('/', createUserRole);
router.put('/:id', updateUserRole);
router.delete('/:id', deleteUserRole);
router.delete('/user/:userId', deleteUserRolesByUserId);
router.delete('/project/:projectId', deleteUserRolesByProjectId);

export default router;
