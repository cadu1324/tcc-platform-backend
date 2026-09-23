import { DeliveryStatus } from './project.types';

export interface Feedback {
  id: number;
  delivery_id: number;
  advisor_id: number;
  comment: string;
  grade: number;
  created_at: Date;
}

export interface CreateFeedbackDTO {
  delivery_id: number;
  advisor_id: number;
  comment: string;
  grade: number;
  status: typeof DeliveryStatus.APPROVED | typeof DeliveryStatus.REJECTED;
}
