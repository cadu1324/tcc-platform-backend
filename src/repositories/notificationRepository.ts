import { query, queryOne } from '../config/database';
import { Notification, CreateNotificationDTO, NotificationType } from '../types/notification.types';

export const notificationRepository = {
  async findByUserId(userId: number): Promise<Notification[]> {
    return query<Notification>(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
  },

  async findById(id: number): Promise<Notification | null> {
    return queryOne<Notification>('SELECT * FROM notifications WHERE id = $1', [id]);
  },

  async create(data: CreateNotificationDTO): Promise<Notification> {
    const result = await queryOne<Notification>(
      `INSERT INTO notifications (user_id, type, message, project_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.user_id, data.type, data.message, data.project_id ?? null]
    );
    return result!;
  },

  async markAsRead(id: number): Promise<Notification | null> {
    return queryOne<Notification>(
      `UPDATE notifications SET is_read = TRUE, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
  },

  async countUnreadByUserId(userId: number): Promise<number> {
    const result = await queryOne<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );
    return result!.count;
  },

  async hasUnreadOfType(userId: number, type: NotificationType): Promise<boolean> {
    const result = await queryOne<{ has_unread: boolean }>(
      `SELECT EXISTS(
         SELECT 1 FROM notifications
         WHERE user_id = $1 AND type = $2 AND is_read = FALSE
       ) AS has_unread`,
      [userId, type]
    );
    return result!.has_unread;
  }
};
