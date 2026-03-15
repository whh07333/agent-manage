import { Role } from '../models/Role';

export class RoleService {
  async getAllRoles(): Promise<Role[]> {
    return Role.findAll({
      order: [['created_at', 'DESC']]
    });
  }

  async getRoleById(id: string): Promise<Role | null> {
    return Role.findByPk(id);
  }

  async getRoleByName(name: string): Promise<Role | null> {
    return Role.findOne({
      where: { name }
    });
  }

  async getSystemRoles(): Promise<Role[]> {
    return Role.findAll({
      where: { is_system: true },
      order: [['created_at', 'DESC']]
    });
  }

  async getCustomRoles(): Promise<Role[]> {
    return Role.findAll({
      where: { is_system: false },
      order: [['created_at', 'DESC']]
    });
  }

  async createRole(data: any): Promise<Role> {
    return Role.create({
      name: data.name,
      description: data.description,
      permissions: data.permissions || [],
      is_system: data.is_system || false
    });
  }

  async updateRole(id: string, data: any): Promise<Role | null> {
    const role = await this.getRoleById(id);
    if (!role) return null;

    // 系统角色不能修改某些关键属性
    if (role.is_system && data.is_system === false) {
      throw new Error('系统角色不能降级为自定义角色');
    }

    return role.update(data);
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.getRoleById(id);
    if (role) {
      if (role.is_system) {
        throw new Error('系统角色不能删除');
      }
      await role.destroy();
    }
  }

  async checkPermission(role: Role, permission: string): Promise<boolean> {
    return role.permissions.includes(permission);
  }

  async getRolesByPermission(permission: string): Promise<Role[]> {
    return Role.findAll({
      where: {
        permissions: {
          [Role.sequelize!.literal('JSON_CONTAINS(permissions, ?)')]: true
        },
        replacements: [JSON.stringify(permission)]
      }
    });
  }
}
