import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';
import { AppError } from './errorHandler';

export function validateRequest(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join(', ');
      next(new AppError(message));
      return;
    }

    req.body = result.data;
    next();
  };
}
