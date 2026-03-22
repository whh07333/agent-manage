import { Request, Response } from 'express';
import { SubscriptionService } from '../services/subscriptions';
import { escapeAllStrings } from '../utils/validation';

const subscriptionService = new SubscriptionService();

export const getAllSubscriptions = async (req: Request, res: Response) => {
  try {
    const subscriptions = await subscriptionService.getAllSubscriptions();
    res.json({
      code: 0,
      msg: 'Success',
      data: subscriptions,
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

export const getSubscriptionById = async (req: Request, res: Response) => {
  try {
    const subscription = await subscriptionService.getSubscriptionById(req.params.id);
    if (!subscription) {
      return res.status(404).json({
        code: 404,
        msg: 'Subscription not found',
        data: null,
        trace_id: req.headers['x-request-id'] || 'default'
      });
    }
    res.json({
      code: 0,
      msg: 'Success',
      data: subscription,
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

export const getSubscriptionsByAgentId = async (req: Request, res: Response) => {
  try {
    const subscriptions = await subscriptionService.getSubscriptionsByAgentId(req.params.agentId);
    res.json({
      code: 0,
      msg: 'Success',
      data: subscriptions,
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

export const getSubscriptionsByTargetId = async (req: Request, res: Response) => {
  try {
    const subscriptions = await subscriptionService.getSubscriptionsByTargetId(req.params.targetId);
    res.json({
      code: 0,
      msg: 'Success',
      data: subscriptions,
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

export const getSubscriptionsByEventType = async (req: Request, res: Response) => {
  try {
    const subscriptions = await subscriptionService.getSubscriptionsByEventType(req.params.eventType);
    res.json({
      code: 0,
      msg: 'Success',
      data: subscriptions,
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

export const createSubscription = async (req: Request, res: Response) => {
  try {
    // Escape all HTML special characters in string inputs
    const escapedData = escapeAllStrings(req.body);
    const subscription = await subscriptionService.createSubscription(escapedData);
    res.status(201).json({
      code: 0,
      msg: 'Subscription created successfully',
      data: subscription,
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

export const updateSubscription = async (req: Request, res: Response) => {
  try {
    // Escape all HTML special characters in string inputs
    const escapedData = escapeAllStrings(req.body);
    const subscription = await subscriptionService.updateSubscription(req.params.id, escapedData);
    if (!subscription) {
      return res.status(404).json({
        code: 404,
        msg: 'Subscription not found',
        data: null,
        trace_id: req.headers['x-request-id'] || 'default'
      });
    }
    res.json({
      code: 0,
      msg: 'Subscription updated successfully',
      data: subscription,
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

export const deleteSubscription = async (req: Request, res: Response) => {
  try {
    await subscriptionService.deleteSubscription(req.params.id);
    res.json({
      code: 0,
      msg: 'Subscription deleted successfully',
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

export const pauseSubscription = async (req: Request, res: Response) => {
  try {
    await subscriptionService.pauseSubscription(req.params.id);
    res.json({
      code: 0,
      msg: 'Subscription paused successfully',
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

export const resumeSubscription = async (req: Request, res: Response) => {
  try {
    await subscriptionService.resumeSubscription(req.params.id);
    res.json({
      code: 0,
      msg: 'Subscription resumed successfully',
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

/**
 * 获取所有死信事件
 */
export const getDeadLetters = async (req: Request, res: Response) => {
  try {
    const deadLetters = await subscriptionService.getDeadLetters();
    res.json({
      code: 0,
      msg: 'Success',
      data: deadLetters,
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

/**
 * 重试单个死信
 */
export const retryDeadLetter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await subscriptionService.retryDeadLetter(id);
    if (!success) {
      return res.status(404).json({
        code: 404,
        msg: 'Dead letter not found',
        data: null,
        trace_id: req.headers['x-request-id'] || 'default'
      });
    }
    res.json({
      code: 0,
      msg: 'Dead letter scheduled for retry',
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

/**
 * 重试所有死信
 */
export const retryAllDeadLetters = async (req: Request, res: Response) => {
  try {
    const count = await subscriptionService.retryAllDeadLetters();
    res.json({
      code: 0,
      msg: `${count} dead letters scheduled for retry`,
      data: { count },
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

/**
 * 删除死信
 */
export const deleteDeadLetter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await subscriptionService.deleteDeadLetter(id);
    if (!success) {
      return res.status(404).json({
        code: 404,
        msg: 'Dead letter not found',
        data: null,
        trace_id: req.headers['x-request-id'] || 'default'
      });
    }
    res.json({
      code: 0,
      msg: 'Dead letter deleted successfully',
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
