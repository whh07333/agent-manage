import { Request, Response } from 'express';
import * as statisticsService from '../services/statistics';
import { logger } from '../utils/logger';

/**
 * Get project overview statistics
 * GET /api/statistics/project/:projectId
 */
export const getProjectOverview = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const { projectId } = req.params;

  try {
    logger.info('Getting project overview', { requestId, projectId });
    const stats = await statisticsService.getProjectOverview(projectId);
    logger.info('Project overview retrieved', { requestId, projectId });
    res.json({
      code: 0,
      msg: 'success',
      data: stats,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get project overview', error as Error, { requestId, projectId });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get agent workload statistics
 * GET /api/statistics/agent/:agentId
 */
export const getAgentWorkload = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const { agentId } = req.params;

  try {
    logger.info('Getting agent workload', { requestId, agentId });
    const stats = await statisticsService.getAgentWorkload(agentId);
    logger.info('Agent workload retrieved', { requestId, agentId });
    res.json({
      code: 0,
      msg: 'success',
      data: stats,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get agent workload', error as Error, { requestId, agentId });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get team efficiency statistics
 * GET /api/statistics/team
 */
export const getTeamEfficiency = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';

  try {
    logger.info('Getting team efficiency statistics', { requestId });
    const stats = await statisticsService.getTeamEfficiency();
    logger.info('Team efficiency retrieved', { requestId });
    res.json({
      code: 0,
      msg: 'success',
      data: stats,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get team efficiency', error as Error, { requestId });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get cross-project statistics
 * GET /api/statistics/cross-project
 */
export const getCrossProjectStatistics = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const { dateFrom, dateTo, agentId, projectId } = req.query;

  try {
    logger.info('Getting cross-project statistics', { requestId, dateFrom, dateTo, agentId, projectId });
    const stats = await statisticsService.getCrossProjectStats({
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      agentId: agentId as string,
      projectId: projectId as string
    });
    logger.info('Cross-project statistics retrieved', { requestId });
    res.json({
      code: 0,
      msg: 'success',
      data: stats,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get cross-project statistics', error as Error, { requestId });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get real-time overview statistics for dashboard
 * GET /api/statistics/realtime/overview
 */
export const getRealTimeOverview = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';

  try {
    logger.info('Getting real-time overview', { requestId });
    const stats = await statisticsService.getRealTimeOverview();
    logger.info('Real-time overview retrieved', { requestId });
    res.json({
      code: 0,
      msg: 'success',
      data: stats,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get real-time overview', error as Error, { requestId });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get real-time activity log for dashboard
 * GET /api/statistics/realtime/activity
 */
export const getRealTimeActivity = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';
  const { limit } = req.query;

  try {
    logger.info('Getting real-time activity', { requestId });
    const activity = await statisticsService.getRealTimeActivity(limit ? parseInt(limit as string) : 50);
    logger.info('Real-time activity retrieved', { requestId });
    res.json({
      code: 0,
      msg: 'success',
      data: activity,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get real-time activity', error as Error, { requestId });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get full real-time statistics
 * GET /api/statistics/realtime
 */
export const getRealTimeStatistics = async (req: Request, res: Response) => {
  const requestId = req.headers['x-request-id'] as string || 'default';

  try {
    logger.info('Getting full real-time statistics', { requestId });
    const stats = await statisticsService.getRealTimeStats();
    logger.info('Full real-time statistics retrieved', { requestId });
    res.json({
      code: 0,
      msg: 'success',
      data: stats,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get real-time statistics', error as Error, { requestId });
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: requestId,
      timestamp: new Date().toISOString()
    });
  }
};
