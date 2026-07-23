import { Request, Response, NextFunction } from 'express';
import { projectService } from '../services/projectService';

export const projectController = {
  async findAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projects = await projectService.findAll();
      res.status(200).json({ success: true, data: projects });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = await projectService.findById(Number(req.params.id));
      res.status(200).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description, student_id, advisor_id, start_date, expected_delivery_date } = req.body;
      const project = await projectService.create({
        title,
        description,
        student_id,
        advisor_id,
        start_date,
        expected_delivery_date
      });
      res.status(201).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description, advisor_id, status, expected_delivery_date } = req.body;
      const project = await projectService.update(Number(req.params.id), {
        title,
        description,
        advisor_id,
        status,
        expected_delivery_date
      });
      res.status(200).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await projectService.delete(Number(req.params.id));
      res.status(200).json({ success: true, data: { message: 'Project deleted successfully' } });
    } catch (error) {
      next(error);
    }
  }
};
