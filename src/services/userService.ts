import { User, CreateUserDTO, UpdateUserDTO, UserResponse } from '../types/user.types';

export const userService = {
  async findAll(): Promise<UserResponse[]> {
    // TODO: Implementar
    return [];
  },

  async findById(id: string): Promise<UserResponse | null> {
    // TODO: Implementar
    return null;
  },

  async create(data: CreateUserDTO): Promise<UserResponse> {
    // TODO: Implementar
    return {} as UserResponse;
  },

  async update(id: string, data: UpdateUserDTO): Promise<UserResponse | null> {
    // TODO: Implementar
    return null;
  },

  async delete(id: string): Promise<boolean> {
    // TODO: Implementar
    return false;
  }
};
