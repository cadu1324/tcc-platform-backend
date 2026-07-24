import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notificationService';

export const notificationController = {
  async findMine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifications = await notificationService.findByUserId(req.user!.id);
      res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notification = await notificationService.markAsRead(Number(req.params.id), req.user!.id);
      res.status(200).json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }
};
