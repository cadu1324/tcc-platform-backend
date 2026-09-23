import { Request, Response, NextFunction } from 'express';
import { feedbackService } from '../services/feedbackService';

export const feedbackController = {
  async findByDeliveryId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const feedbacks = await feedbackService.findByDeliveryId(Number(req.params.deliveryId), req.user!);
      res.status(200).json({ success: true, data: feedbacks });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { delivery_id, comment, grade, status } = req.body;
      const advisorId = req.user!.id;
      const feedback = await feedbackService.create({ delivery_id, advisor_id: advisorId, comment, grade, status });
      res.status(201).json({ success: true, data: feedback });
    } catch (error) {
      next(error);
    }
  }
};
