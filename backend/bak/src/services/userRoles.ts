import { UserRole } from '../models/UserRole';

export class UserRoleService {
  async getAllUserRoles(): Promise<UserRole[]> {
    return UserRole.findAll({
      order: [['created_at', 'DESC']]
    });
  }

  async getUserRoleById(id: string): Promise<UserRole | null> {
    return UserRole.findByPk(id);
  }

  async getUserRolesByUserId(userId: string): Promise<UserRole[]> {
    return UserRole.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });
  }

  async getUserRolesByRoleId(roleId: string): Promise<UserRole[]> {
    return UserRole.findAll({
      where: { role_id: roleId },
      order: [['created_at', 'DESC']]
    });
  }

  async getUserRolesByProjectId(projectId: string): Promise<UserRole[]> {
    return UserRole.findAll({
      where: { project_id: projectId },
      order: [['created_at', 'DESC']]
    });
  }

  async getUserRolesByUserIdAndProjectId(userId: string, projectId: string): Promise<UserRole[]> {
    return UserRole.findAll({
      where: {
        user_id: userId,
        project_id: projectId
      },
      order: [['created_at', 'DESC']]
    });
  }

  async createUserRole(data: any): Promise<UserRole> {
    return UserRole.create({
      user_id: data.user_id,
      role_id: data.role_id,
      project_id: data.project_id
    });
  }

  async updateUserRole(id: string, data: any): Promise<UserRole | null> {
    const userRole = await this.getUserRoleById(id);
    if (!userRole) return null;

    return userRole.update(data);
  }

  async deleteUserRole(id: string): Promise<void> {
    const userRole = await this.getUserRoleById(id);
    if (userRole) {
      await userRole.destroy();
    }
  }

  async deleteUserRolesByUserId(userId: string): Promise<void> {
    await UserRole.destroy({
      where: { user_id: userId }
    });
  }

  async deleteUserRolesByProjectId(projectId: string): Promise<void> {
    await UserRole.destroy({
      where: { project_id: projectId }
    });
  }
}
