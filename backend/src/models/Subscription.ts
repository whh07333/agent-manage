import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

export class Subscription extends Model {
  public id!: string;
  public project_id?: string;
  public event_types!: string[];
  public callback_url!: string;
  public secret?: string;
  public is_active!: boolean;
  public retry_policy?: any;
  public last_triggered_at?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Subscription.init(
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
    event_types: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    callback_url: {
      type: DataTypes.STRING,
      allowNull: false,
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
      defaultValue: {
        max_retries: 3,
        retry_interval: 1000,
        backoff_multiplier: 2,
      },
    },
    last_triggered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "subscriptions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["project_id", "is_active"] },
      { fields: ["is_active"] },
    ],
  },
);

export default Subscription;
