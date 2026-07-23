export enum MilestoneStatus {
  PENDING = 'pending',
  COMPLETED = 'completed'
}

export interface Milestone {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  due_date: Date | null;
  status: MilestoneStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CreateMilestoneDTO {
  project_id: number;
  title: string;
  description?: string;
  due_date?: Date;
}

export interface UpdateMilestoneDTO {
  title?: string;
  description?: string;
  due_date?: Date;
  status?: MilestoneStatus;
}
