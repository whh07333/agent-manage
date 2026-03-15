import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Project } from './Project';

export class ProjectAgent extends Model {
  public id!: string;
  public project_id!: string;
  public agent_id!: string;
  public role!: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ProjectAgent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    project_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Project,
        key: 'id'
      }
    },
    agent_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'member'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'project_agents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_project_agent_project',
        fields: ['project_id']
      },
      {
        name: 'idx_project_agent_agent',
        fields: ['agent_id']
      },
      {
        name: 'idx_project_agent_project_agent',
        fields: ['project_id', 'agent_id']
      }
    ]
  }
);

export default ProjectAgent;
