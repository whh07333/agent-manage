import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

export class AuditLog extends Model {
  public id!: string;
  public project_id?: string;
  public user_id?: string;
  public action!: string;
  public resource_type!: string;
  public resource_id!: string;
  public content?: any;
  public ip_address?: string;
  public user_agent?: string;
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
      
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      
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
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "audit_logs",
    timestamps: true,
    updatedAt: false,
    createdAt: "created_at",
    indexes: [
      { fields: ["project_id", "created_at"] },
      { fields: ["user_id", "created_at"] },
      { fields: ["action", "created_at"] },
    ],
  },
);

export default AuditLog;
