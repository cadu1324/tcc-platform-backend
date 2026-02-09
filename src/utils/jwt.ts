import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserType } from '../types/user.types';

export interface TokenPayload {
  id: string;
  user_type: UserType;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '24h' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}
