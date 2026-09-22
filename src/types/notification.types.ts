export enum NotificationType {
  DELIVERY_CREATED = 'delivery_created',
  FEEDBACK_REGISTERED = 'feedback_registered',
  MILESTONE_CREATED = 'milestone_created',
  MILESTONE_UPDATED = 'milestone_updated',
  MESSAGE_RECEIVED = 'message_received',
  MILESTONE_DUE_SOON = 'milestone_due_soon',
  MILESTONE_OVERDUE = 'milestone_overdue'
}

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  message: string;
  project_id: number | null;
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateNotificationDTO {
  user_id: number;
  type: NotificationType;
  message: string;
  project_id?: number;
}
