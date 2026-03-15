import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export class AuditLog extends Model {
  public id!: string;
  public actor_id!: string;
  public actor_type!: string; // 'agent' or 'human'
  public action!: string;
  public target_type!: string; // 'project', 'task', 'user', 'subscription', etc.
  public target_id!: string;
  public parameters!: any;
  public result!: string; // 'success', 'failed', 'pending'
  public error_message!: string;
  public readonly created_at!: Date;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    actor_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    actor_type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['agent', 'human']]
      }
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    target_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    target_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    parameters: {
      type: DataTypes.JSON,
      allowNull: true
    },
    result: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'success',
      validate: {
        isIn: [['success', 'failed', 'pending']]
      }
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'audit_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        name: 'idx_audit_log_actor',
        fields: ['actor_id', 'actor_type']
      },
      {
        name: 'idx_audit_log_target',
        fields: ['target_type', 'target_id']
      },
      {
        name: 'idx_audit_log_created',
        fields: ['created_at']
      }
    ]
  }
);

export default AuditLog;
