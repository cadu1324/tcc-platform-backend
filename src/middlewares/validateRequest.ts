import { Request, Response, NextFunction } from 'express';

export function validateRequest(schema: unknown) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // TODO: Implementar validação com schema (zod, joi, etc)
    next();
  };
}
