import express from 'express';
import { 
  login, 
  register, 
  getUserProfile,
  updateUserProfile,
  getUsers
} from '../controllers/users';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

// Authentication routes
router.post('/login', login);
router.post('/register', register);

// User profile routes
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, getUsers);

export default router;
