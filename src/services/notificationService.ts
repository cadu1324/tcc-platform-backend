import { Notification, CreateNotificationDTO, NotificationType } from '../types/notification.types';
import { notificationRepository } from '../repositories/notificationRepository';
import { AppError } from '../middlewares/errorHandler';

export const notificationService = {
  async findByUserId(userId: number): Promise<Notification[]> {
    return notificationRepository.findByUserId(userId);
  },

  async create(data: CreateNotificationDTO): Promise<Notification> {
    return notificationRepository.create(data);
  },

  async hasUnread(userId: number, type: NotificationType): Promise<boolean> {
    return notificationRepository.hasUnreadOfType(userId, type);
  },

  async markAsRead(id: number, userId: number): Promise<Notification> {
    const notification = await notificationRepository.findById(id);
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.user_id !== userId) {
      throw new AppError('You can only mark your own notifications as read', 403);
    }

    const updated = await notificationRepository.markAsRead(id);
    return updated!;
  }
};
