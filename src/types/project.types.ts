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
  knowledge_area: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AdvisorProject extends Project {
  student_name: string;
  milestones_total: number;
  milestones_completed: number;
}

export interface AdminProject extends Project {
  student_name: string;
  advisor_name: string | null;
  milestones_total: number;
  milestones_completed: number;
}

export interface CreateProjectDTO {
  title: string;
  description: string;
  student_id: number;
  advisor_id: number;
  knowledge_area: string;
  start_date?: Date;
  expected_delivery_date?: Date;
}

export interface UpdateProjectDTO {
  title?: string;
  description?: string;
  advisor_id?: number;
  status?: ProjectStatus;
  expected_delivery_date?: Date;
  knowledge_area?: string;
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
  milestone_id: number | null;
  title: string;
  description: string;
  deadline: Date | null;
  status: DeliveryStatus;
  file_url: string | null;
  file_name: string | null;
  submitted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface DeliveryWithMilestone extends Delivery {
  milestone_title: string | null;
}

export interface CreateDeliveryDTO {
  project_id: number;
  milestone_id: number;
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
  file_name?: string;
  submitted_at?: Date;
}
