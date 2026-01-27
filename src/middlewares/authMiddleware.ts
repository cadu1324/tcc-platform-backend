import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // TODO: Implementar
  // 1. Extrair token do header Authorization (Bearer token)
  // 2. Verificar token com verifyToken()
  // 3. Adicionar user ao req.user
  // 4. Chamar next() ou retornar 401
  next();
}

export function requireRole(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // TODO: Implementar
    // 1. Verificar se req.user existe
    // 2. Verificar se req.user.type está em roles
    // 3. Chamar next() ou retornar 403
    next();
  };
}
