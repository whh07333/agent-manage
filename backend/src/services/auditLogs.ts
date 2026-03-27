import { AuditLog } from '../models/AuditLog';
import { Op } from 'sequelize';

export class AuditLogService {
  async createAuditLog(data: any): Promise<AuditLog> {
    return AuditLog.create({
      projectId: data.project_id || data.target_id || 'unknown',
      userId: data.user_id || data.actor_id || 'unknown',
      action: data.action,
      resourceType: data.resource_type || data.target_type || 'unknown',
      resourceId: data.resource_id || data.target_id || 'unknown',
      content: data.parameters,
      result: data.result || 'success',
      error_message: data.error_message
    });
  }

  async getAuditLogsByActor(actorId: string, actorType?: string): Promise<AuditLog[]> {
    const where: any = { actor_id: actorId };
    if (actorType) {
      where.actor_type = actorType;
    }

    return AuditLog.findAll({
      where,
      order: [['created_at', 'DESC']]
    });
  }

  async getAuditLogsByTarget(targetType: string, targetId?: string): Promise<AuditLog[]> {
    const where: any = { target_type: targetType };
    if (targetId) {
      where.target_id = targetId;
    }

    return AuditLog.findAll({
      where,
      order: [['created_at', 'DESC']]
    });
  }

  async getAuditLogsByAction(action: string): Promise<AuditLog[]> {
    return AuditLog.findAll({
      where: { action },
      order: [['created_at', 'DESC']]
    });
  }

  async getAuditLogsByTimeRange(startTime: Date, endTime: Date): Promise<AuditLog[]> {
    return AuditLog.findAll({
      where: {
        created_at: {
          [Op.between]: [startTime, endTime]
        }
      },
      order: [['created_at', 'DESC']]
    });
  }

  async getAllAuditLogs(): Promise<AuditLog[]> {
    return AuditLog.findAll({
      order: [['created_at', 'DESC']]
    });
  }

  async getAuditLogById(id: string): Promise<AuditLog | null> {
    return AuditLog.findByPk(id);
  }

  async searchAuditLogs(query: string): Promise<AuditLog[]> {
    return AuditLog.findAll({
      where: {
        [Op.or]: [
          { action: { [Op.like]: `%${query}%` } },
          { target_type: { [Op.like]: `%${query}%` } },
          { error_message: { [Op.like]: `%${query}%` } }
        ]
      },
      order: [['created_at', 'DESC']]
    });
  }
}
