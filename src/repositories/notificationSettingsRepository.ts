import { queryOne } from '../config/database';
import type {
  NotificationSettings,
  UpdateNotificationSettingsDTO
} from '../types/notificationSettings.types';

export const notificationSettingsRepository = {
  async get(): Promise<NotificationSettings | null> {
    return queryOne<NotificationSettings>('SELECT * FROM notification_settings WHERE id = 1');
  },

  async update(data: UpdateNotificationSettingsDTO): Promise<NotificationSettings | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.notify_student_on_feedback !== undefined) {
      fields.push(`notify_student_on_feedback = $${paramIndex++}`);
      values.push(data.notify_student_on_feedback);
    }
    if (data.notify_advisor_on_delivery_submitted !== undefined) {
      fields.push(`notify_advisor_on_delivery_submitted = $${paramIndex++}`);
      values.push(data.notify_advisor_on_delivery_submitted);
    }
    if (data.notify_admin_on_milestone_overdue !== undefined) {
      fields.push(`notify_admin_on_milestone_overdue = $${paramIndex++}`);
      values.push(data.notify_admin_on_milestone_overdue);
    }
    if (data.email_copy_enabled !== undefined) {
      fields.push(`email_copy_enabled = $${paramIndex++}`);
      values.push(data.email_copy_enabled);
    }
    if (data.email_digest_frequency !== undefined) {
      fields.push(`email_digest_frequency = $${paramIndex++}`);
      values.push(data.email_digest_frequency);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);

    return queryOne<NotificationSettings>(
      `UPDATE notification_settings SET ${fields.join(', ')} WHERE id = 1
       RETURNING *`,
      values
    );
  }
};
