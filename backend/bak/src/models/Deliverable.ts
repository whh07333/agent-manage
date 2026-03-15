import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Task } from './Task';

export class Deliverable extends Model {
  public id!: string;
  public task_id!: string;
  public name!: string;
  public type!: string; // 'document', 'code', 'report', 'image', etc.
  public url!: string;
  public version!: string;
  public description!: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Deliverable.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    task_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Task,
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255]
      }
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'document',
      validate: {
        notEmpty: true
      }
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true
      }
    },
    version: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '1.0.0'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'deliverables',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_deliverable_task',
        fields: ['task_id']
      },
      {
        name: 'idx_deliverable_active',
        fields: ['is_active']
      }
    ]
  }
);

export default Deliverable;
