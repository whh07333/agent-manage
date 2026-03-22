import express from 'express';
import {
  getProjectOverview,
  getAgentWorkload,
  getTeamEfficiency,
  getCrossProjectStatistics,
  getRealTimeStatistics,
  getRealTimeOverview,
  getRealTimeActivity
} from '../controllers/statistics';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/project/:projectId', authMiddleware, adminMiddleware, getProjectOverview);
router.get('/agent/:agentId', authMiddleware, adminMiddleware, getAgentWorkload);
router.get('/team', authMiddleware, adminMiddleware, getTeamEfficiency);
router.get('/cross-project', authMiddleware, adminMiddleware, getCrossProjectStatistics);
router.get('/realtime', authMiddleware, adminMiddleware, getRealTimeStatistics);
router.get('/realtime/overview', authMiddleware, adminMiddleware, getRealTimeOverview);
router.get('/realtime/activity', authMiddleware, adminMiddleware, getRealTimeActivity);

export default router;
