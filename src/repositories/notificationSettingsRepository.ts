import { prisma } from '../config/prisma';
import { Prisma } from '../generated/prisma/client';
import {
  EmailDigestFrequency,
  type NotificationSettings,
  type UpdateNotificationSettingsDTO
} from '../types/notificationSettings.types';

/** email_digest_frequency is a plain VARCHAR (constrained by a CHECK, not a Postgres enum), so Prisma types it as string. */
function asSettings<T>(row: T): T & { email_digest_frequency: EmailDigestFrequency } {
  return row as T & { email_digest_frequency: EmailDigestFrequency };
}

export const notificationSettingsRepository = {
  async get(): Promise<NotificationSettings | null> {
    const row = await prisma.notification_settings.findUnique({ where: { id: 1 } });
    return row && asSettings(row);
  },

  async update(data: UpdateNotificationSettingsDTO): Promise<NotificationSettings | null> {
    const updateData: Prisma.notification_settingsUpdateInput = {};

    if (data.notify_student_on_feedback !== undefined) {
      updateData.notify_student_on_feedback = data.notify_student_on_feedback;
    }
    if (data.notify_advisor_on_delivery_submitted !== undefined) {
      updateData.notify_advisor_on_delivery_submitted = data.notify_advisor_on_delivery_submitted;
    }
    if (data.notify_admin_on_milestone_overdue !== undefined) {
      updateData.notify_admin_on_milestone_overdue = data.notify_admin_on_milestone_overdue;
    }
    if (data.email_copy_enabled !== undefined) {
      updateData.email_copy_enabled = data.email_copy_enabled;
    }
    if (data.email_digest_frequency !== undefined) {
      updateData.email_digest_frequency = data.email_digest_frequency;
    }

    if (Object.keys(updateData).length === 0) return null;

    const row = await prisma.notification_settings.update({ where: { id: 1 }, data: updateData });
    return asSettings(row);
  }
};
