import { queryOne, query } from '../config/database';
import { User, UserResponse, UpdateUserDTO, AdvisorOption, UserType } from '../types/user.types';

export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    return queryOne<User>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
  },

  async findById(id: number): Promise<User | null> {
    return queryOne<User>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
  },

  async create(name: string, email: string, passwordHash: string, userType: string): Promise<UserResponse> {
    const result = await queryOne<UserResponse>(
      `INSERT INTO users (name, email, password_hash, user_type)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, user_type, is_active, created_at, updated_at`,
      [name, email, passwordHash, userType]
    );
    return result!;
  },

  async findAll(): Promise<UserResponse[]> {
    return query<UserResponse>(
      'SELECT id, name, email, user_type, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
  },

  async findAdvisors(): Promise<AdvisorOption[]> {
    return query<AdvisorOption>(
      `SELECT id, name FROM users
       WHERE user_type = $1 AND is_active = true
       ORDER BY name`,
      [UserType.ADVISOR]
    );
  },

  async update(id: number, data: UpdateUserDTO): Promise<UserResponse | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.name) {
      fields.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.email) {
      fields.push(`email = $${paramIndex++}`);
      values.push(data.email);
    }
    if (data.password) {
      fields.push(`password_hash = $${paramIndex++}`);
      values.push(data.password);
    }
    if (data.user_type) {
      fields.push(`user_type = $${paramIndex++}`);
      values.push(data.user_type);
    }
    if (data.is_active !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(data.is_active);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    return queryOne<UserResponse>(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, name, email, user_type, is_active, created_at, updated_at`,
      values
    );
  },

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, id]
    );
  },

  async deactivate(id: number): Promise<boolean> {
    const result = await queryOne<UserResponse>(
      `UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1
       RETURNING id`,
      [id]
    );
    return !!result;
  }
};
