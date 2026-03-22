import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

export class DeadLetterEvent extends Model {
  public id!: string;
  public subscriptionId!: string;
  public eventType!: string;
  public eventPayload!: Record<string, any>;
  public retryCount!: number;
  public lastError!: string | null;
  public lastFailedAt!: Date | null;
  public retryScheduledAt!: Date | null;
  public expireAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DeadLetterEvent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    subscriptionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    eventType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    eventPayload: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    retryCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lastError: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: "dead_letter_events",
    underscored: true,
    indexes: [
      {
        fields: ['expire_at'],
      }
    ]
  }
);

export default DeadLetterEvent;
