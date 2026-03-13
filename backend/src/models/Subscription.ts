import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export class Subscription extends Model {
  public id!: string;
  public agent_id!: string;
  public event_type!: string;
  public target_id!: string; // project_id or task_id
  public callback_url!: string;
  public filter_rules!: any;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Subscription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    agent_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    event_type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    target_id: {
      type: DataTypes.UUID,
      allowNull: true // null for all projects/tasks
    },
    callback_url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true
      }
    },
    filter_rules: {
      type: DataTypes.JSON,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'subscriptions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Subscription;
