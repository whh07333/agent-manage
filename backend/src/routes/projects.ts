import express from 'express';
import { 
  getAllProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject,
  archiveProject
} from '../controllers/projects';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get all projects
router.get('/', authMiddleware, getAllProjects);

// Get project by id
router.get('/:id', authMiddleware, getProjectById);

// Create project
router.post('/', authMiddleware, createProject);

// Update project
router.put('/:id', authMiddleware, updateProject);

// Delete project
router.delete('/:id', authMiddleware, deleteProject);

// Archive project
router.post('/:id/archive', authMiddleware, archiveProject);

export default router;
