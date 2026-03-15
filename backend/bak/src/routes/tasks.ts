import express from 'express';
import { 
  getAllTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask,
  updateTaskStatus,
  assignTask
} from '../controllers/tasks';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get all tasks
router.get('/', authMiddleware, getAllTasks);

// Get task by id
router.get('/:id', authMiddleware, getTaskById);

// Create task
router.post('/', authMiddleware, createTask);

// Update task
router.put('/:id', authMiddleware, updateTask);

// Delete task
router.delete('/:id', authMiddleware, deleteTask);

// Update task status
router.patch('/:id/status', authMiddleware, updateTaskStatus);

// Assign task
router.patch('/:id/assign', authMiddleware, assignTask);

export default router;
