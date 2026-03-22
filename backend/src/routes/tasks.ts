import express from 'express';
import {
  getAllTasks,
  getTaskById,
  getTasksByProject,
  getTasksByAssignee,
  getTasksByStatus,
  createTask,
  updateTask,
  deleteTask,
  acceptTask,
  acceptanceTask,
  blockTask,
  unblockTask,
  getTaskStatistics,
} from '../controllers/tasks';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, getAllTasks);
router.get('/:id', authMiddleware, getTaskById);
router.get('/project/:projectId', authMiddleware, getTasksByProject);
router.get('/assignee/:assigneeId', authMiddleware, getTasksByAssignee);
router.get('/status/:status', authMiddleware, getTasksByStatus);
router.post('/', authMiddleware, createTask);
router.put('/:id', authMiddleware, updateTask);
router.delete('/:id', authMiddleware, deleteTask);
router.post('/:id/accept', authMiddleware, acceptTask);
router.post('/:id/acceptance', authMiddleware, acceptanceTask);
router.post('/:id/block', authMiddleware, blockTask);
router.post('/:id/unblock', authMiddleware, unblockTask);
router.get('/statistics/overview', authMiddleware, getTaskStatistics);

export default router;
