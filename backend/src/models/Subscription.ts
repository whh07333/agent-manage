import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Project } from './Project';

export class Subscription extends Model {
  public id!: string;
  public project_id!: string | null;
  public event_types!: string[];
  public callback_url!: string;
  public secret!: string | null;
  public is_active!: boolean;
  public retry_policy!: any;
  public last_triggered_at!: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 关联关系
  static associate(models: any) {
    Subscription.belongsTo(models.Project, {
      foreignKey: 'project_id',
      as: 'project',
    });
  }
}

Subscription.init(
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
    event_types: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    callback_url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        isUrl: true,
        len: [1, 2048],
      },
    },
    secret: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    retry_policy: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    last_triggered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'subscriptions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Subscription;
