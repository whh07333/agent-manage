import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export class ProjectAgent extends Model {
  public id!: string;
  public projectId!: string;
  public agentId!: string;
  public role!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProjectAgent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    agentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'member',
      validate: {
        isIn: [['admin', 'member', 'viewer']],
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'project_agents',
    underscored: true,
    indexes: [
      {
        fields: ['project_id'],
      },
      {
        fields: ['agent_id'],
      },
      {
        fields: ['project_id', 'agent_id'],
        unique: true,
      },
    ],
  }
);

export default ProjectAgent;
