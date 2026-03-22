import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import { Project } from "./Project";

export class Task extends Model {
  public id!: string;
  public projectId!: string;
  public name!: string;
  public description!: string | null;
  public assigneeId!: string | null;
  public assignee_agent_id!: string | null;
  public parentId!: string | null;
  public priority!: string;
  public status!: string;
  public statusRemark!: string | null;
  public dueDate!: Date | null;
  public deliverables!: any[] | null;
  public deletedAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联关系
  static associate(models: any) {
    // 一个任务属于一个项目
    Task.belongsTo(models.Project, {
      foreignKey: "projectId",
      as: "project",
    });
    // 一个任务依赖于另一个父前置任务
    Task.belongsTo(models.Task, {
      foreignKey: "parentId",
      as: "parent",
    });
  }
}

Task.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "projects",
        key: "id",
      },
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
    assigneeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    assignee_agent_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
      references: {
        model: "tasks",
        key: "id",
      },
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
      defaultValue: "pending",
      validate: {
        isIn: [
          ["pending", "in_progress", "completed", "blocked", "cancelled"],
        ],
      },
    },
    statusRemark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deliverables: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: "tasks",
    underscored: true,
  },
);

export default Task;
