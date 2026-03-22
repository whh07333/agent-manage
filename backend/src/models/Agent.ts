import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

export class Agent extends Model {
  public id!: string;
  public name!: string;
  public description!: string | null;
  public type!: string;
  public status!: string;
  public createdBy!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Agent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'backend-dev',
      validate: {
        isIn: [['backend-dev', 'frontend-dev', 'test-engineer', 'product-manager', 'other']],
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "active",
      validate: {
        isIn: [["active", "inactive", "archived"]],
      },
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "agents",
    underscored: true,
  }
);

export default Agent;
