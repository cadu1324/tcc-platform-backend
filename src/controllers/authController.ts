import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, user_type } = req.body;
      const result = await authService.register({ name, email, password, user_type });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.forgotPassword({ email: req.body.email });
      res.status(200).json({
        success: true,
        data: { message: 'If an account exists for that email, reset instructions have been sent' }
      });
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;
      await authService.resetPassword({ token, password });
      res.status(200).json({ success: true, data: { message: 'Password updated successfully' } });
    } catch (error) {
      next(error);
    }
  }
};
