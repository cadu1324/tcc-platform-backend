import {
  NotificationSettings,
  UpdateNotificationSettingsDTO,
  EmailDigestFrequency
} from '../types/notificationSettings.types';
import { notificationSettingsRepository } from '../repositories/notificationSettingsRepository';
import { AppError } from '../middlewares/errorHandler';

// Mesmos defaults da migration 012 (INSERT INTO notification_settings (id) VALUES (1)).
// Usado como fallback se a linha singleton sumir, para nao derrubar toda
// criacao de notificacao do sistema com um 404.
function defaultSettings(): NotificationSettings {
  return {
    id: 1,
    notify_student_on_feedback: true,
    notify_advisor_on_delivery_submitted: true,
    notify_admin_on_milestone_overdue: true,
    email_copy_enabled: false,
    email_digest_frequency: EmailDigestFrequency.DAILY,
    updated_at: new Date()
  };
}

export const notificationSettingsService = {
  async get(): Promise<NotificationSettings> {
    const settings = await notificationSettingsRepository.get();
    return settings ?? defaultSettings();
  },

  async update(data: UpdateNotificationSettingsDTO): Promise<NotificationSettings> {
    if (
      data.email_digest_frequency !== undefined &&
      !Object.values(EmailDigestFrequency).includes(data.email_digest_frequency)
    ) {
      throw new AppError('Invalid email digest frequency');
    }

    const updated = await notificationSettingsRepository.update(data);
    if (!updated) {
      throw new AppError('No fields to update');
    }
    return updated;
  }
};
