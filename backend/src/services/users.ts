import { User } from '../models/User';
import bcrypt from 'bcryptjs';

export class UserService {
  async login(email: string, password: string): Promise<User | null> {
    const user = await User.findOne({ where: { email } });
    
    if (!user) return null;
    
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) return null;
    
    return user;
  }

  async register(data: any): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    return User.create({
      email: data.email,
      passwordHash: hashedPassword,
      name: data.name,
      role: data.role || 'user'
    });
  }

  async getUserById(id: string): Promise<User | null> {
    return User.findByPk(id, {
      attributes: { exclude: ['passwordHash'] }
    });
  }

  async getUsers(): Promise<User[]> {
    return User.findAll({
      attributes: { exclude: ['passwordHash'] }
    });
  }

  async updateUserProfile(id: string, data: any): Promise<User | null> {
    const user = await this.getUserById(id);
    if (!user) return null;
    
    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }
    
    return user.update(data);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.getUserById(id);
    if (user) {
      await user.destroy();
    }
  }

  async updateUserRole(id: string, role: string): Promise<User | null> {
    const user = await this.getUserById(id);
    if (!user) return null;
    
    return user.update({ role });
  }
}
