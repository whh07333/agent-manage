import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Project } from './Project';
import { User } from './User';

export class AuditLog extends Model {
  public id!: string;
  public project_id!: string | null;
  public user_id!: string;
  public action!: string;
  public resource_type!: string;
  public resource_id!: string;
  public content!: any;
  public ip_address!: string;
  public user_agent!: string;
  public readonly created_at!: Date;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resource_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resource_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    content: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        name: 'idx_audit_logs_project_id',
        fields: ['project_id', 'created_at'],
      },
      {
        name: 'idx_audit_logs_user_id',
        fields: ['user_id', 'created_at'],
      },
    ],
  },
);

export default AuditLog;
