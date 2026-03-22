import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Project } from './Project';

export class AuditLog extends Model {
  public id!: string;
  public projectId!: string | null;
  public userId!: string | null;
  public action!: string;
  public resourceType!: string;
  public resourceId!: string;
  public content!: Record<string, any> | null;
  public ipAddress!: string | null;
  public userAgent!: string | null;
  public readonly createdAt!: Date;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    project_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Project,
        key: 'id',
      },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Project,
        key: 'id',
      },
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      },
    },
    resource_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resource_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    content: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    underscored: true,
  }
);

export default AuditLog;
