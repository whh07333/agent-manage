import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import { Task } from "./Task";
import { ProjectAgent } from "./ProjectAgent";

export class Project extends Model {
  public id!: string;
  public name!: string;
  public description!: string;
  public manager_id!: string;
  public priority!: string;
  public status!: string;
  public due_date!: Date;
  public is_archived!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 关联关系
  static associate(models: any) {
    // 一个项目有多个任务
    Project.hasMany(models.Task, {
      foreignKey: "project_id",
      as: "tasks",
    });
    // 一个项目有多个项目成员
    Project.hasMany(models.ProjectAgent, {
      foreignKey: "project_id",
      as: "agents",
    });
  }
}

Project.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    manager_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "medium",
      validate: {
        isIn: [["low", "medium", "high"]],
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
    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_archived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "projects",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Project;
