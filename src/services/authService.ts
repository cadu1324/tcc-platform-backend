import { RegisterDTO, UserResponse, UserType } from '../types/user.types';
import type { ForgotPasswordDTO, ResetPasswordDTO } from '../types/passwordReset.types';
import type { RefreshTokenDTO } from '../types/refreshToken.types';
import { userRepository } from '../repositories/userRepository';
import { passwordResetRepository } from '../repositories/passwordResetRepository';
import { refreshTokenRepository } from '../repositories/refreshTokenRepository';
import { hashPassword, comparePassword } from '../utils/hashPassword';
import { generateAccessToken } from '../utils/jwt';
import { generateResetToken, hashResetToken } from '../utils/resetToken';
import { generateRefreshToken, hashRefreshToken } from '../utils/refreshToken';
import { sendMail } from '../utils/sendMail';
import { env } from '../config/env';
import { AppError } from '../middlewares/errorHandler';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const REFRESH_TOKEN_TTL_MS = env.jwtRefreshExpiresInDays * 24 * 60 * 60 * 1000;

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserResponse;
  access_token: string;
  refresh_token: string;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

async function issueTokenPair(userId: number, userType: UserType): Promise<RefreshResponse> {
  const access_token = generateAccessToken({ id: userId, user_type: userType });
  const { token, tokenHash } = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await refreshTokenRepository.create(userId, tokenHash, expiresAt);

  return { access_token, refresh_token: token };
}

export const authService = {
  async register(data: RegisterDTO): Promise<AuthResponse> {
    if (!data.name || !data.email || !data.password) {
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
    const user = await userRepository.create(data.name, data.email, passwordHash, UserType.STUDENT);
    const tokens = await issueTokenPair(user.id, user.user_type);

    return { user, ...tokens };
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

    const userResponse: UserResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      user_type: user.user_type,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    const tokens = await issueTokenPair(user.id, user.user_type);

    return { user: userResponse, ...tokens };
  },

  async refresh({ refresh_token }: RefreshTokenDTO): Promise<RefreshResponse> {
    const record = await refreshTokenRepository.findValidByHash(hashRefreshToken(refresh_token));
    if (!record) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    await refreshTokenRepository.revoke(record.id);

    const user = await userRepository.findById(record.user_id);
    if (!user || !user.is_active) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    return issueTokenPair(user.id, user.user_type);
  },

  async logout({ refresh_token }: RefreshTokenDTO): Promise<void> {
    const record = await refreshTokenRepository.findValidByHash(hashRefreshToken(refresh_token));
    if (record) {
      await refreshTokenRepository.revoke(record.id);
    }
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
