export enum EmailDigestFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly'
}

export interface NotificationSettings {
  id: number;
  notify_student_on_feedback: boolean;
  notify_advisor_on_delivery_submitted: boolean;
  notify_admin_on_milestone_overdue: boolean;
  email_copy_enabled: boolean;
  email_digest_frequency: EmailDigestFrequency;
  updated_at: Date;
}

export interface UpdateNotificationSettingsDTO {
  notify_student_on_feedback?: boolean;
  notify_advisor_on_delivery_submitted?: boolean;
  notify_admin_on_milestone_overdue?: boolean;
  email_copy_enabled?: boolean;
  email_digest_frequency?: EmailDigestFrequency;
}
