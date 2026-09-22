import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserType } from '../types/user.types';

export interface TokenPayload {
  id: number;
  user_type: UserType;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtAccessExpiresIn });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}
