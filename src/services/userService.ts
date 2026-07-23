import { CreateUserDTO, UpdateUserDTO, UserResponse } from '../types/user.types';
import { userRepository } from '../repositories/userRepository';
import { hashPassword } from '../utils/hashPassword';
import { AppError } from '../middlewares/errorHandler';

export const userService = {
  async findAll(): Promise<UserResponse[]> {
    return userRepository.findAll();
  },

  async findById(id: number): Promise<UserResponse> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { password_hash, ...userResponse } = user;
    return userResponse;
  },

  async create(data: CreateUserDTO): Promise<UserResponse> {
    if (!data.name || !data.email || !data.password || !data.user_type) {
      throw new AppError('All fields are required');
    }

    if (data.password.length < 6) {
      throw new AppError('Password must be at least 6 characters');
    }

    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email already registered');
    }

    const passwordHash = await hashPassword(data.password);
    return userRepository.create(data.name, data.email, passwordHash, data.user_type);
  },

  async update(id: number, data: UpdateUserDTO, requesterId: number): Promise<UserResponse> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Usuário não-admin só pode editar o próprio perfil
    const requester = await userRepository.findById(requesterId);
    if (!requester) {
      throw new AppError('Requester not found', 404);
    }

    const isAdmin = requester.user_type === 'admin';
    const isSelf = requesterId === id;

    if (!isAdmin && !isSelf) {
      throw new AppError('You can only update your own profile', 403);
    }

    // Não pode mudar user_type do próprio usuário
    if (isSelf && data.user_type) {
      throw new AppError('You cannot change your own user type', 403);
    }

    if (data.email) {
      const existing = await userRepository.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new AppError('Email already in use');
      }
    }

    if (data.password) {
      if (data.password.length < 6) {
        throw new AppError('Password must be at least 6 characters');
      }
      data.password = await hashPassword(data.password);
    }

    const updated = await userRepository.update(id, data);
    if (!updated) {
      throw new AppError('No fields to update');
    }

    return updated;
  },

  async delete(id: number): Promise<void> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const deactivated = await userRepository.deactivate(id);
    if (!deactivated) {
      throw new AppError('Failed to deactivate user');
    }
  }
};
