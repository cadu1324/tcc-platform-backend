import { Request, Response, NextFunction } from 'express';
import { deliveryService } from '../services/deliveryService';
import { deliveryFileService } from '../services/deliveryFileService';
import { attachmentDisposition } from '../utils/contentDisposition';

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
  },

  async submit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const delivery = await deliveryFileService.submitWithFile({
        deliveryId: Number(req.params.id),
        userId: req.user!.id,
        userType: req.user!.user_type,
        file: req.file
      });
      res.status(200).json({ success: true, data: delivery });
    } catch (error) {
      next(error);
    }
  },

  async downloadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = await deliveryFileService.getFileForUser({
        deliveryId: Number(req.params.id),
        userId: req.user!.id,
        userType: req.user!.user_type
      });

      res.setHeader('Content-Type', file.mime_type);
      res.setHeader('Content-Length', file.size_bytes);
      res.setHeader('Content-Disposition', attachmentDisposition(file.file_name));
      res.send(file.content);
    } catch (error) {
      next(error);
    }
  }
};
