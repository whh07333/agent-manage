import { Role } from '../models/Role';

export class RoleService {
  async getAllRoles(): Promise<Role[]> {
    return Role.findAll({
      order: [['name', 'ASC']]
    });
  }

  async getRoleById(id: string): Promise<Role | null> {
    return Role.findByPk(id);
  }

  async getRoleByName(name: string): Promise<Role | null> {
    return Role.findOne({ where: { name } });
  }

  async getSystemRoles(): Promise<Role[]> {
    return Role.findAll({
      where: {
        is_system: true
      },
      order: [['name', 'ASC']]
    });
  }

  async getCustomRoles(): Promise<Role[]> {
    return Role.findAll({
      where: {
        is_system: false
      },
      order: [['name', 'ASC']]
    });
  }

  async createRole(data: { name: string; description: string; permissions: string[], is_system?: boolean }): Promise<Role> {
    return Role.create({
      name: data.name,
      description: data.description,
      permissions: data.permissions,
      is_system: data.is_system || false,
    });
  }

  async updateRole(id: string, data: { name?: string; description?: string; permissions?: string[], is_system?: boolean }): Promise<Role | null> {
    const role = await Role.findByPk(id);
    if (!role) return null;

    await role.update(data);
    return role;
  }

  async deleteRole(id: string): Promise<void> {
    const role = await Role.findByPk(id);
    if (role) {
      await role.destroy();
    }
  }

  async getRolesByPermission(permission: string): Promise<Role[]> {
    const literal = JSON.stringify(permission);
    return Role.findAll({
      where: {
        permissions: Role.sequelize!.literal(`JSON_CONTAINS(permissions, '${literal}')`),
      },
    });
  }

  async checkPermission(roleId: string, permission: string): Promise<boolean> {
    const role = await Role.findByPk(roleId);
    if (!role) return false;
    
    const permissions = role.permissions as string[];
    return permissions.includes(permission);
  }
}
