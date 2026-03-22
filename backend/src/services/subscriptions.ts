import { Subscription } from '../models/Subscription';
import { DeadLetterEvent } from '../models/DeadLetterEvent';
import { Op } from 'sequelize';

export class SubscriptionService {
  async getAllSubscriptions(): Promise<Subscription[]> {
    return Subscription.findAll({
      where: { is_active: true },
      order: [['created_at', 'DESC']]
    });
  }

  async getSubscriptionById(id: string): Promise<Subscription | null> {
    return Subscription.findByPk(id);
  }

  async getSubscriptionsByAgentId(agentId: string): Promise<Subscription[]> {
    return Subscription.findAll({
      where: {
        agent_id: agentId,
        is_active: true
      },
      order: [['created_at', 'DESC']]
    });
  }

  async getSubscriptionsByTargetId(targetId: string): Promise<Subscription[]> {
    return Subscription.findAll({
      where: {
        target_id: targetId,
        is_active: true
      },
      order: [['created_at', 'DESC']]
    });
  }

  async getSubscriptionsByEventType(eventType: string): Promise<Subscription[]> {
    return Subscription.findAll({
      where: {
        event_type: eventType,
        is_active: true
      },
      order: [['created_at', 'DESC']]
    });
  }

  async createSubscription(data: any): Promise<Subscription> {
    // 重要：init() 中定义的键名是 camelCase，所以这里必须传入 camelCase 给 Sequelize
    // 我们对每个字段尝试 camelCase，如果没有找到尝试 snake_case，兼容两种输入格式
    return Subscription.create({
      agentId: data.agentId ?? data.agent_id,
      agentType: data.agentType ?? data.agent_type,
      eventType: data.eventType ?? data.event_type,
      targetId: data.targetId ?? data.target_id,
      callbackUrl: data.callbackUrl ?? data.callback_url,
      secret: data.secret ?? data.secret,
      isActive: data.isActive !== undefined ? data.isActive : (data.is_active !== undefined ? data.is_active : true),
      maxRetries: data.maxRetries ?? data.max_retries ?? 5,
      expireAt: data.expireAt ?? data.expire_at ?? null,
    });
  }

  async updateSubscription(id: string, data: any): Promise<Subscription | null> {
    const subscription = await this.getSubscriptionById(id);
    if (!subscription) return null;

    return subscription.update(data);
  }

  async deleteSubscription(id: string): Promise<void> {
    const subscription = await this.getSubscriptionById(id);
    if (subscription) {
      await subscription.destroy();
    }
  }

  async pauseSubscription(id: string): Promise<void> {
    const subscription = await this.getSubscriptionById(id);
    if (subscription) {
      await subscription.update({ is_active: false });
    }
  }

  async resumeSubscription(id: string): Promise<void> {
    const subscription = await this.getSubscriptionById(id);
    if (subscription) {
      await subscription.update({ is_active: true });
    }
  }

  /**
   * 获取所有死信事件
   */
  async getDeadLetters(): Promise<DeadLetterEvent[]> {
    return DeadLetterEvent.findAll({
      order: [['created_at', 'DESC']]
    });
  }

  /**
   * 重试单个死信
   */
  async retryDeadLetter(id: string): Promise<boolean> {
    const deadLetter = await DeadLetterEvent.findByPk(id);
    if (!deadLetter) {
      return false;
    }
    
    // 标记为重试中，实际重试由job处理
    await deadLetter.update({
      retried: true,
      retriedAt: new Date()
    });
    
    return true;
  }

  /**
   * 重试所有死信
   */
  async retryAllDeadLetters(): Promise<number> {
    const [count] = await DeadLetterEvent.update(
      {
        retried: true,
        retriedAt: new Date()
      },
      {
        where: {
          retried: false
        }
      }
    );
    
    return count;
  }

  /**
   * 删除死信
   */
  async deleteDeadLetter(id: string): Promise<boolean> {
    const deleted = await DeadLetterEvent.destroy({ where: { id } });
    return deleted > 0;
  }
}
