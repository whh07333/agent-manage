import { Request, Response } from 'express';
import { AuditLogService } from '../services/auditLogs';

const auditLogService = new AuditLogService();

export const getAllAuditLogs = async (req: Request, res: Response) => {
  try {
    let limit: number | undefined;
    if (req.query.limit) {
      const parsed = parseInt(req.query.limit as string);
      if (!isNaN(parsed) && parsed > 0) {
        limit = parsed;
      }
    }
    const auditLogs = await auditLogService.getAllAuditLogs(limit);
    res.json({
      code: 0,
      msg: 'Success',
      data: auditLogs,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  }
};

export const getAuditLogById = async (req: Request, res: Response) => {
  try {
    const auditLog = await auditLogService.getAuditLogById(req.params.id as string);
    if (!auditLog) {
      return res.status(404).json({
        code: 404,
        msg: 'Audit log not found',
        data: null,
        trace_id: req.headers['x-request-id'] || 'default'
      });
    }
    res.json({
      code: 0,
      msg: 'Success',
      data: auditLog,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  }
};

export const getAuditLogsByActor = async (req: Request, res: Response) => {
  try {
    const auditLogs = await auditLogService.getAuditLogsByActor(
      req.params.actorId as string,
      (req.query.actorType as string) || undefined
    );
    res.json({
      code: 0,
      msg: 'Success',
      data: auditLogs,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  }
};

export const getAuditLogsByTarget = async (req: Request, res: Response) => {
  try {
    const auditLogs = await auditLogService.getAuditLogsByTarget(
      req.params.targetType as string,
      (req.query.targetId as string) || undefined
    );
    res.json({
      code: 0,
      msg: 'Success',
      data: auditLogs,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  }
};

export const getAuditLogsByAction = async (req: Request, res: Response) => {
  try {
    const auditLogs = await auditLogService.getAuditLogsByAction(req.params.action as string);
    res.json({
      code: 0,
      msg: 'Success',
      data: auditLogs,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  }
};

export const getAuditLogsByTimeRange = async (req: Request, res: Response) => {
  try {
    const { startTime, endTime } = req.query;
    if (!startTime || !endTime) {
      return res.status(400).json({
        code: 400,
        msg: 'Start time and end time are required',
        data: null,
        trace_id: req.headers['x-request-id'] || 'default'
      });
    }

    const auditLogs = await auditLogService.getAuditLogsByTimeRange(
      new Date(startTime as string),
      new Date(endTime as string)
    );
    res.json({
      code: 0,
      msg: 'Success',
      data: auditLogs,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  }
};

export const searchAuditLogs = async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    if (!query) {
      return res.status(400).json({
        code: 400,
        msg: 'Search query is required',
        data: null,
        trace_id: req.headers['x-request-id'] || 'default'
      });
    }

    const auditLogs = await auditLogService.searchAuditLogs(query);
    res.json({
      code: 0,
      msg: 'Success',
      data: auditLogs,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      msg: error instanceof Error ? error.message : 'Internal server error',
      data: null,
      trace_id: req.headers['x-request-id'] || 'default'
    });
  }
};
