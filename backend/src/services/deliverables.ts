import { Deliverable } from '../models/Deliverable';

export class DeliverableService {
  async getAllDeliverables(): Promise<Deliverable[]> {
    return Deliverable.findAll({
      where: { is_active: true },
      order: [['created_at', 'DESC']]
    });
  }

  async getDeliverableById(id: string): Promise<Deliverable | null> {
    return Deliverable.findByPk(id);
  }

  async getDeliverablesByTaskId(taskId: string): Promise<Deliverable[]> {
    return Deliverable.findAll({
      where: {
        task_id: taskId,
        is_active: true
      },
      order: [['created_at', 'DESC']]
    });
  }

  async createDeliverable(data: any): Promise<Deliverable> {
    return Deliverable.create({
      task_id: data.task_id,
      name: data.name,
      type: data.type,
      url: data.url,
      version: data.version,
      description: data.description
    });
  }

  async updateDeliverable(id: string, data: any): Promise<Deliverable | null> {
    const deliverable = await this.getDeliverableById(id);
    if (!deliverable) return null;

    return deliverable.update(data);
  }

  async deleteDeliverable(id: string): Promise<void> {
    const deliverable = await this.getDeliverableById(id);
    if (deliverable) {
      await deliverable.update({ is_active: false });
    }
  }

  async restoreDeliverable(id: string): Promise<void> {
    const deliverable = await this.getDeliverableById(id);
    if (deliverable) {
      await deliverable.update({ is_active: true });
    }
  }
}
