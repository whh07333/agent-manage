import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

export class ApiKey extends Model {
  public id!: string;
  public agentId!: string;
  public keyPrefix!: string;
  public keyHash!: string;
  public name!: string;
  public status!: string;
  public lastUsedAt!: Date | null;
  public expiresAt!: Date | null;
  public createdBy!: string;
  public isActive!: boolean;
  public revokedAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ApiKey.init(
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
    keyPrefix: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    keyHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "active",
      validate: {
        isIn: [["active", "revoked"]],
      },
    },
    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "api_keys",
    underscored: true,
  }
);

export default ApiKey;
