import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message
    });
    return;
  }

  if (error.name === 'MulterError') {
    const isTooLarge = 'code' in error && (error as { code?: string }).code === 'LIMIT_FILE_SIZE';
    res.status(400).json({
      success: false,
      error: isTooLarge ? 'File exceeds the 20 MB limit' : 'File upload failed'
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
}
