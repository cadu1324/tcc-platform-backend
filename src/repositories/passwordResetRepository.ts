import { query, queryOne } from '../config/database';
import type { PasswordResetToken } from '../types/passwordReset.types';

export const passwordResetRepository = {
  async create(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
    await query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );
  },

  async findValidByHash(tokenHash: string): Promise<PasswordResetToken | null> {
    return queryOne<PasswordResetToken>(
      `SELECT * FROM password_reset_tokens
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()`,
      [tokenHash]
    );
  },

  async markUsed(id: number): Promise<void> {
    await query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [id]);
  },

  async deleteByUserId(userId: number): Promise<void> {
    await query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);
  }
};
