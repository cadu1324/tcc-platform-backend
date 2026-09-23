import { prisma } from '../config/prisma';
import { Notification, CreateNotificationDTO, NotificationType } from '../types/notification.types';

/** Prisma's generated notification_type_enum has the same string values as NotificationType, but is a distinct nominal type. */
function asNotification<T>(row: T): T & { type: NotificationType } {
  return row as T & { type: NotificationType };
}

export const notificationRepository = {
  async findByUserId(userId: number): Promise<Notification[]> {
    const rows = await prisma.notifications.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
    return rows.map(asNotification);
  },

  async findById(id: number): Promise<Notification | null> {
    const row = await prisma.notifications.findUnique({ where: { id } });
    return row && asNotification(row);
  },

  async create(data: CreateNotificationDTO): Promise<Notification> {
    const row = await prisma.notifications.create({
      data: {
        user_id: data.user_id,
        type: data.type,
        message: data.message,
        project_id: data.project_id ?? null
      }
    });
    return asNotification(row);
  },

  async markAsRead(id: number): Promise<Notification | null> {
    const row = await prisma.notifications.update({
      where: { id },
      data: { is_read: true }
    });
    return row && asNotification(row);
  },

  async countUnreadByUserId(userId: number): Promise<number> {
    return prisma.notifications.count({ where: { user_id: userId, is_read: false } });
  },

  async hasUnreadOfType(userId: number, type: NotificationType): Promise<boolean> {
    const count = await prisma.notifications.count({
      where: { user_id: userId, type, is_read: false }
    });
    return count > 0;
  },

  async existsExact(
    userId: number,
    type: NotificationType,
    projectId: number,
    message: string
  ): Promise<boolean> {
    const count = await prisma.notifications.count({
      where: { user_id: userId, type, project_id: projectId, message }
    });
    return count > 0;
  }
};
