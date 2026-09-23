import { prisma } from '../config/prisma';
import type { PasswordResetToken } from '../types/passwordReset.types';

export const passwordResetRepository = {
  async create(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
    await prisma.password_reset_tokens.create({
      data: { user_id: userId, token_hash: tokenHash, expires_at: expiresAt }
    });
  },

  async findValidByHash(tokenHash: string): Promise<PasswordResetToken | null> {
    return prisma.password_reset_tokens.findFirst({
      where: { token_hash: tokenHash, used_at: null, expires_at: { gt: new Date() } }
    });
  },

  async markUsed(id: number): Promise<void> {
    await prisma.password_reset_tokens.update({
      where: { id },
      data: { used_at: new Date() }
    });
  },

  async deleteByUserId(userId: number): Promise<void> {
    await prisma.password_reset_tokens.deleteMany({ where: { user_id: userId } });
  }
};
