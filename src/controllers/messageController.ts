import { Request, Response, NextFunction } from 'express';
import { messageService } from '../services/messageService';

export const messageController = {
  async findContacts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, user_type } = req.user!;
      const contacts = await messageService.findContacts(id, user_type);
      res.status(200).json({ success: true, data: contacts });
    } catch (error) {
      next(error);
    }
  },

  async findConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const messages = await messageService.findConversation(req.user!.id, Number(req.params.userId));
      res.status(200).json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { recipient_id, content } = req.body;
      const message = await messageService.create({ sender_id: req.user!.id, recipient_id, content });
      res.status(201).json({ success: true, data: message });
    } catch (error) {
      next(error);
    }
  }
};
