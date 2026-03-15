import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Role } from './Role';

export class UserRole extends Model {
  public id!: string;
  public user_id!: string;
  public role_id!: string;
  public project_id!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

UserRole.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Role,
        key: 'id'
      }
    },
    project_id: {
      type: DataTypes.UUID,
      allowNull: true // null for system-level roles
    }
  },
  {
    sequelize,
    tableName: 'user_roles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_user_role_user',
        fields: ['user_id']
      },
      {
        name: 'idx_user_role_project',
        fields: ['project_id']
      },
      {
        name: 'idx_user_role_user_project',
        fields: ['user_id', 'project_id']
      }
    ]
  }
);

export default UserRole;
