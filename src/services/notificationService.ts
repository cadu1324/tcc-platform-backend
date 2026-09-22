import { Notification, CreateNotificationDTO, NotificationType } from '../types/notification.types';
import { notificationRepository } from '../repositories/notificationRepository';
import { notificationSettingsService } from './notificationSettingsService';
import { userRepository } from '../repositories/userRepository';
import { sendMail } from '../utils/sendMail';
import { AppError } from '../middlewares/errorHandler';

export const notificationService = {
  async findByUserId(userId: number): Promise<Notification[]> {
    return notificationRepository.findByUserId(userId);
  },

  async create(data: CreateNotificationDTO): Promise<Notification> {
    const notification = await notificationRepository.create(data);

    // Best-effort: a copia por e-mail nunca pode derrubar a operacao que
    // gerou a notificacao (feedback, entrega, mensagem...), que ja foi
    // persistida acima. Falha de SMTP ou settings vira log, nao erro 500.
    try {
      const settings = await notificationSettingsService.get();
      if (settings.email_copy_enabled) {
        const recipient = await userRepository.findById(data.user_id);
        if (recipient) {
          await sendMail({
            to: recipient.email,
            subject: 'New notification',
            text: notification.message
          });
        }
      }
    } catch (error) {
      console.error('Failed to send notification email copy:', error);
    }

    return notification;
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
