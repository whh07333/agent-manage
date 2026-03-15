import { Request, Response } from 'express';
import { DeliverableService } from '../services/deliverables';

const deliverableService = new DeliverableService();

export const getAllDeliverables = async (req: Request, res: Response) => {
  try {
    const deliverables = await deliverableService.getAllDeliverables();
    res.json({
      code: 0,
      msg: 'Success',
      data: deliverables,
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

export const getDeliverableById = async (req: Request, res: Response) => {
  try {
    const deliverable = await deliverableService.getDeliverableById(req.params.id as string);
    if (!deliverable) {
      return res.status(404).json({
        code: 404,
        msg: 'Deliverable not found',
        data: null,
        trace_id: req.headers['x-request-id'] || 'default'
      });
    }
    res.json({
      code: 0,
      msg: 'Success',
      data: deliverable,
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

export const getDeliverablesByTaskId = async (req: Request, res: Response) => {
  try {
    const deliverables = await deliverableService.getDeliverablesByTaskId(req.params.taskId as string);
    res.json({
      code: 0,
      msg: 'Success',
      data: deliverables,
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

export const createDeliverable = async (req: Request, res: Response) => {
  try {
    const deliverable = await deliverableService.createDeliverable(req.body);
    res.status(201).json({
      code: 0,
      msg: 'Deliverable created successfully',
      data: deliverable,
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

export const updateDeliverable = async (req: Request, res: Response) => {
  try {
    const deliverable = await deliverableService.updateDeliverable(req.params.id as string, req.body);
    if (!deliverable) {
      return res.status(404).json({
        code: 404,
        msg: 'Deliverable not found',
        data: null,
        trace_id: req.headers['x-request-id'] || 'default'
      });
    }
    res.json({
      code: 0,
      msg: 'Deliverable updated successfully',
      data: deliverable,
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

export const deleteDeliverable = async (req: Request, res: Response) => {
  try {
    await deliverableService.deleteDeliverable(req.params.id as string);
    res.json({
      code: 0,
      msg: 'Deliverable deleted successfully',
      data: null,
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

export const restoreDeliverable = async (req: Request, res: Response) => {
  try {
    await deliverableService.restoreDeliverable(req.params.id as string);
    res.json({
      code: 0,
      msg: 'Deliverable restored successfully',
      data: null,
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
