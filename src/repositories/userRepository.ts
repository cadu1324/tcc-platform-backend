import { User, CreateUserDTO, UpdateUserDTO } from '../types/user.types';

export const userRepository = {
  async findAll(): Promise<User[]> {
    // TODO: Implementar
    return [];
  },

  async findById(id: string): Promise<User | null> {
    // TODO: Implementar
    return null;
  },

  async findByEmail(email: string): Promise<User | null> {
    // TODO: Implementar
    return null;
  },

  async create(data: CreateUserDTO): Promise<User> {
    // TODO: Implementar
    return {} as User;
  },

  async update(id: string, data: UpdateUserDTO): Promise<User | null> {
    // TODO: Implementar
    return null;
  },

  async delete(id: string): Promise<boolean> {
    // TODO: Implementar
    return false;
  }
};
