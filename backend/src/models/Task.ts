import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import { Project } from "./Project";

export class Task extends Model {
  public id!: string;
  public project_id!: string;
  public name!: string;
  public description!: string;
  public assignee_id!: string;
  public parent_id!: string | null;
  public priority!: string;
  public status!: string;
  public status_remark!: string;
  public due_date!: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 关联关系
  static associate(models: any) {
    // 一个任务属于一个项目
    Task.belongsTo(models.Project, {
      foreignKey: "project_id",
      as: "project",
    });
    // 一个任务依赖于另一个父前置任务
    Task.belongsTo(models.Task, {
      foreignKey: "parent_id",
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
    project_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Project,
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
    assignee_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
      references: {
        model: Task,
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
          [
            "pending",
            "assigned",
            "in_progress",
            "blocked",
            "pending_review",
            "approved",
            "rejected",
            "canceled",
            "completed",
          ],
        ],
      },
    },
    status_remark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "tasks",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Task;
