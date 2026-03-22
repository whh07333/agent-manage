import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export class Project extends Model {
  public id!: string;
  public name!: string;
  public description!: string | null;
  public managerId!: string;
  public priority!: string;
  public status!: string;
  public startDate!: Date | null;
  public endDate!: Date | null;
  public dueDate!: Date | null;
  public isArchived!: boolean;
  public archiveNote!: string | null;
  public archivedAt!: Date | null;
  public archivedBy!: string | null;
  public deletedAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
    managerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'medium',
      validate: {
        isIn: [['low', 'medium', 'high']],
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'inactive', 'archived']],
      },
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    archiveNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    archivedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    archivedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'projects',
    underscored: true,
  }
);

export default Project;
