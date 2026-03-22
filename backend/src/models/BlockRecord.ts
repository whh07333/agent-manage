import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

export class BlockRecord extends Model {
  public id!: string;
  public taskId!: string;
  public blockReason!: string;
  public relatedTasks!: string[];
  public blockedBy!: string;
  public blockedAt!: Date;
  public resolvedAt!: Date | null;
  public resolvedBy!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BlockRecord.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    taskId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    blockReason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    relatedTasks: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: false,
      defaultValue: [],
    },
    blockedBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    blockedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resolvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "block_records",
    underscored: true,
  }
);

export default BlockRecord;
