export enum ProjectStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface Project {
  id: string;
  title: string;
  description: string;
  student_id: string;
  advisor_id: string | null;
  status: ProjectStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProjectDTO {
  title: string;
  description: string;
  student_id: string;
  advisor_id?: string;
}

export interface UpdateProjectDTO {
  title?: string;
  description?: string;
  advisor_id?: string;
  status?: ProjectStatus;
}

export interface Delivery {
  id: string;
  project_id: string;
  title: string;
  description: string;
  file_url: string | null;
  feedback: string | null;
  grade: number | null;
  delivered_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDeliveryDTO {
  project_id: string;
  title: string;
  description: string;
  file_url?: string;
}

export interface UpdateDeliveryDTO {
  title?: string;
  description?: string;
  file_url?: string;
  feedback?: string;
  grade?: number;
  delivered_at?: Date;
}
