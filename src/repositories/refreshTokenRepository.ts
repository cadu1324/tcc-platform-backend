import { query, queryOne } from '../config/database';
import type { RefreshToken } from '../types/refreshToken.types';

export const refreshTokenRepository = {
  async create(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );
  },

  async findValidByHash(tokenHash: string): Promise<RefreshToken | null> {
    return queryOne<RefreshToken>(
      `SELECT * FROM refresh_tokens
       WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()`,
      [tokenHash]
    );
  },

  async revoke(id: number): Promise<void> {
    await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1', [id]);
  }
};
