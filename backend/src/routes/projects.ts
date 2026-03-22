import express from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  archiveProject,
  unarchiveProject,
  getProjectsByManager,
} from '../controllers/projects';

import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, getAllProjects);
router.get('/:id', authMiddleware, getProjectById);
router.post('/', authMiddleware, createProject);
router.put('/:id', authMiddleware, updateProject);
router.delete('/:id', authMiddleware, deleteProject);
router.post('/:id/archive', authMiddleware, archiveProject);
router.post('/:id/unarchive', authMiddleware, unarchiveProject);
router.get('/manager/:managerId', authMiddleware, getProjectsByManager);

export default router;
