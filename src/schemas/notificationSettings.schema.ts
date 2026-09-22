import { z } from 'zod';
import { EmailDigestFrequency } from '../types/notificationSettings.types';

export const updateNotificationSettingsSchema = z.object({
  notify_student_on_feedback: z.boolean().optional(),
  notify_advisor_on_delivery_submitted: z.boolean().optional(),
  notify_admin_on_milestone_overdue: z.boolean().optional(),
  email_copy_enabled: z.boolean().optional(),
  email_digest_frequency: z.nativeEnum(EmailDigestFrequency).optional()
});
