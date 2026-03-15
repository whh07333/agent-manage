import { Subscription } from '../models/Subscription';

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
    return Subscription.create({
      agent_id: data.agent_id,
      event_type: data.event_type,
      target_id: data.target_id,
      callback_url: data.callback_url,
      filter_rules: data.filter_rules || {},
      is_active: data.is_active !== undefined ? data.is_active : true
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
}
