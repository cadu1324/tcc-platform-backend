import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';

export const userController = {
  async findAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.findAll();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.findById(Number(req.params.id));
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, user_type } = req.body;
      const user = await userService.create({ name, email, password, user_type });
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, user_type } = req.body;
      const requesterId = req.user!.id;
      const user = await userService.update(Number(req.params.id), { name, email, password, user_type }, requesterId);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await userService.delete(Number(req.params.id));
      res.status(200).json({ success: true, data: { message: 'User deactivated successfully' } });
    } catch (error) {
      next(error);
    }
  }
};
