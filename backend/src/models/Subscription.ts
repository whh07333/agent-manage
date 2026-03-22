import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

export class Subscription extends Model {
  public id!: string;
  public agentId!: string;
  public agentType!: string;
  public targetId!: string | null;
  public eventType!: string;
  public callbackUrl!: string;
  public secret!: string | null;
  public isActive!: boolean;
  public maxRetries!: number;
  public retryCount!: number;
  public lastFailedAt!: Date | null;
  public retryScheduledAt!: Date | null;
  public expireAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Subscription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    agentType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    targetId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    eventType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    callbackUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    secret: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    maxRetries: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    retryCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lastFailedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    retryScheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expireAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "subscriptions",
    underscored: true,
    indexes: [
      {
        fields: ['expire_at'],
      },
    ]
  }
);

export default Subscription;
