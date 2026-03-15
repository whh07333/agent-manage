import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export class Project extends Model {
  public id!: string;
  public name!: string;
  public description!: string | null;
  public manager_id!: string;
  public priority!: string;
  public status!: string;
  public start_date!: Date | null;
  public end_date!: Date | null;
  public tags!: string[] | null;
  public config!: Record<string, any> | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Project.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    manager_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'P1',
      validate: {
        isIn: [['P0', 'P1', 'P2', 'P3']]
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'inactive', 'archived']]
      }
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: []
    },
    config: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    }
  },
  {
    sequelize,
    tableName: 'projects',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Project;
