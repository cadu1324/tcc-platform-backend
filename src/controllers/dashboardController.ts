import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboardService';

export const dashboardController = {
  async getMine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dashboard = await dashboardService.getForUser(req.user!.id, req.user!.user_type);
      res.status(200).json({ success: true, data: dashboard });
    } catch (error) {
      next(error);
    }
  }
};
