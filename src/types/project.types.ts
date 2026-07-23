export enum ProjectStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Project {
  id: number;
  title: string;
  description: string;
  status: ProjectStatus;
  start_date: Date | null;
  expected_delivery_date: Date | null;
  student_id: number;
  advisor_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProjectDTO {
  title: string;
  description: string;
  student_id: number;
  advisor_id?: number;
  start_date?: Date;
  expected_delivery_date?: Date;
}

export interface UpdateProjectDTO {
  title?: string;
  description?: string;
  advisor_id?: number;
  status?: ProjectStatus;
  expected_delivery_date?: Date;
}

export enum DeliveryStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface Delivery {
  id: number;
  project_id: number;
  title: string;
  description: string;
  deadline: Date | null;
  status: DeliveryStatus;
  file_url: string | null;
  submitted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDeliveryDTO {
  project_id: number;
  title: string;
  description: string;
  deadline?: Date;
}

export interface UpdateDeliveryDTO {
  title?: string;
  description?: string;
  deadline?: Date;
  status?: DeliveryStatus;
  file_url?: string;
  submitted_at?: Date;
}
