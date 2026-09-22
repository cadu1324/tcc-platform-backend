import { Request, Response, NextFunction } from 'express';
import { notificationSettingsService } from '../services/notificationSettingsService';

export const notificationSettingsController = {
  async get(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await notificationSettingsService.get();
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await notificationSettingsService.update(req.body);
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  }
};
