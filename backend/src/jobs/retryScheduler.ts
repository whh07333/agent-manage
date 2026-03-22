import { Op } from 'sequelize';
import { Subscription } from '../models/Subscription';
import { DeadLetterEvent } from '../models/DeadLetterEvent';
import { eventEmitter } from '../events/eventEmitter';
import { logger } from '../utils/logger';

/**
 * 重试调度器 - 每分钟扫描需要重试的订阅
 */
export async function runRetryScheduler() {
  try {
    logger.info('Running retry scheduler...');

    // Find all Subscriptions that have scheduled retry
    const now = new Date();
    const Subscriptions = await Subscription.findAll({
      where: {
        status: 'active',
        retry_scheduled_at: {
          [Op.lte]: now
        }
      }
    });

    logger.info(`Found ${Subscriptions.length} Subscriptions to retry`, {
      count: Subscriptions.length
    });

    for (const Subscription of Subscriptions) {
      // Calculate next retry delay based on retry count
      // 1st retry: 1 minute, 2nd: 5 minutes, 3rd: 15 minutes -> dead letter
      let retryCount = Subscription.retryCount || 0;
      let nextDelay = 0;

      if (retryCount === 0) {
        nextDelay = 1 * 60 * 1000;
      } else if (retryCount === 1) {
        nextDelay = 5 * 60 * 1000;
      } else if (retryCount >= 2) {
        // Move to dead letter queue
        logger.warn(`Subscription ${Subscription.id} has failed 3 times, moving to dead letter`);
        
        // TODO: Store the last failed event to dead letter
        await Subscription.update({
          retry_scheduled_at: null
        });
        continue;
      }

      const nextRetryAt = new Date(now.getTime() + nextDelay);
      await Subscription.update({
        retry_scheduled_at: nextRetryAt,
        retryCount: retryCount + 1
      });
    }

    logger.info('Retry scheduler completed', {
      processed: Subscriptions.length
    });
  } catch (error) {
    logger.error('Error in retry scheduler', error as Error);
  }
}

/**
 * Cleanup expired dead letter events (older than 7 days)
 */
export async function cleanupExpiredDeadLetters() {
  try {
    logger.info('Cleaning up expired dead letter events...');

    const now = new Date();
    const expired = await DeadLetterEvent.destroy({
      where: {
        expire_at: {
          [Op.lte]: now
        }
      }
    });

    logger.info(`Cleaned up ${expired} expired dead letter events`, {
      deleted: expired
    });
  } catch (error) {
    logger.error('Error cleaning up expired dead letters', error as Error);
  }
}
