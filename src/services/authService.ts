import { CreateUserDTO, UserResponse } from '../types/user.types';
import { userRepository } from '../repositories/userRepository';
import { hashPassword, comparePassword } from '../utils/hashPassword';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middlewares/errorHandler';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

export const authService = {
  async register(data: CreateUserDTO): Promise<AuthResponse> {
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
    const user = await userRepository.create(data.name, data.email, passwordHash, data.user_type);
    const token = generateToken({ id: user.id, user_type: user.user_type });

    return { user, token };
  },

  async login(data: LoginDTO): Promise<AuthResponse> {
    if (!data.email || !data.password) {
      throw new AppError('Email and password are required');
    }

    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.is_active) {
      throw new AppError('Account is deactivated', 401);
    }

    const validPassword = await comparePassword(data.password, user.password_hash);
    if (!validPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = generateToken({ id: user.id, user_type: user.user_type });

    const userResponse: UserResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      user_type: user.user_type,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    return { user: userResponse, token };
  }
};
