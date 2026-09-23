import { Request, Response, NextFunction } from 'express';
import { milestoneService } from '../services/milestoneService';

export const milestoneController = {
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const milestones = await milestoneService.findAll(req.user!);
      res.status(200).json({ success: true, data: milestones });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const milestone = await milestoneService.findById(Number(req.params.id), req.user!);
      res.status(200).json({ success: true, data: milestone });
    } catch (error) {
      next(error);
    }
  },

  async findByProjectId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const milestones = await milestoneService.findByProjectId(Number(req.params.projectId), req.user!);
      res.status(200).json({ success: true, data: milestones });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { project_id, title, description, due_date } = req.body;
      const milestone = await milestoneService.create(
        { project_id, title, description, due_date },
        req.user!
      );
      res.status(201).json({ success: true, data: milestone });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description, due_date, status } = req.body;
      const milestone = await milestoneService.update(
        Number(req.params.id),
        { title, description, due_date, status },
        req.user!
      );
      res.status(200).json({ success: true, data: milestone });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await milestoneService.delete(Number(req.params.id), req.user!);
      res.status(200).json({ success: true, data: { message: 'Milestone deleted successfully' } });
    } catch (error) {
      next(error);
    }
  }
};
