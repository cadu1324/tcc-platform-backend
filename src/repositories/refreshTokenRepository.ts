import { prisma } from '../config/prisma';
import type { RefreshToken } from '../types/refreshToken.types';

export const refreshTokenRepository = {
  async create(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
    await prisma.refresh_tokens.create({
      data: { user_id: userId, token_hash: tokenHash, expires_at: expiresAt }
    });
  },

  async findValidByHash(tokenHash: string): Promise<RefreshToken | null> {
    return prisma.refresh_tokens.findFirst({
      where: { token_hash: tokenHash, revoked_at: null, expires_at: { gt: new Date() } }
    });
  },

  async revoke(id: number): Promise<void> {
    await prisma.refresh_tokens.update({
      where: { id },
      data: { revoked_at: new Date() }
    });
  }
};
