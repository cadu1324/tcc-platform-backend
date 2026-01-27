import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserType } from '../types/user.types';

export interface TokenPayload {
  id: string;
  email: string;
  type: UserType;
}

export function generateToken(payload: TokenPayload): string {
  // TODO: Implementar
  return '';
}

export function verifyToken(token: string): TokenPayload | null {
  // TODO: Implementar
  return null;
}
