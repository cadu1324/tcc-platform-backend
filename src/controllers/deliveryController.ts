import { Request, Response, NextFunction } from 'express';
import { deliveryService } from '../services/deliveryService';

export const deliveryController = {
  async findAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deliveries = await deliveryService.findAll();
      res.status(200).json({ success: true, data: deliveries });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const delivery = await deliveryService.findById(Number(req.params.id));
      res.status(200).json({ success: true, data: delivery });
    } catch (error) {
      next(error);
    }
  },

  async findByProjectId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deliveries = await deliveryService.findByProjectId(Number(req.params.projectId));
      res.status(200).json({ success: true, data: deliveries });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { project_id, title, description, deadline } = req.body;
      const delivery = await deliveryService.create({ project_id, title, description, deadline });
      res.status(201).json({ success: true, data: delivery });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description, deadline, status, file_url, submitted_at } = req.body;
      const delivery = await deliveryService.update(Number(req.params.id), {
        title,
        description,
        deadline,
        status,
        file_url,
        submitted_at
      });
      res.status(200).json({ success: true, data: delivery });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await deliveryService.delete(Number(req.params.id));
      res.status(200).json({ success: true, data: { message: 'Delivery deleted successfully' } });
    } catch (error) {
      next(error);
    }
  }
};
