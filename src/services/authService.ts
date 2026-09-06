import { CreateUserDTO, UserResponse } from '../types/user.types';
import type { ForgotPasswordDTO, ResetPasswordDTO } from '../types/passwordReset.types';
import { userRepository } from '../repositories/userRepository';
import { passwordResetRepository } from '../repositories/passwordResetRepository';
import { hashPassword, comparePassword } from '../utils/hashPassword';
import { generateToken } from '../utils/jwt';
import { generateResetToken, hashResetToken } from '../utils/resetToken';
import { sendMail } from '../utils/sendMail';
import { env } from '../config/env';
import { AppError } from '../middlewares/errorHandler';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

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
  },

  async forgotPassword({ email }: ForgotPasswordDTO): Promise<void> {
    const user = await userRepository.findByEmail(email);
    // Never reveal whether the email exists; deactivated accounts get no link either.
    if (!user || !user.is_active) {
      return;
    }

    const { token, tokenHash } = generateResetToken();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await passwordResetRepository.deleteByUserId(user.id);
    await passwordResetRepository.create(user.id, tokenHash, expiresAt);

    const resetUrl = `${env.frontendUrl}/reset-password?token=${token}`;
    await sendMail({
      to: user.email,
      subject: 'Reset your password',
      text: `We received a request to reset your password. Open the link below to choose a new one (valid for 1 hour):\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`
    });
  },

  async resetPassword({ token, password }: ResetPasswordDTO): Promise<void> {
    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters');
    }

    const record = await passwordResetRepository.findValidByHash(hashResetToken(token));
    if (!record) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const user = await userRepository.findById(record.user_id);
    if (!user || !user.is_active) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const passwordHash = await hashPassword(password);
    await userRepository.updatePassword(record.user_id, passwordHash);
    await passwordResetRepository.markUsed(record.id);
  }
};
