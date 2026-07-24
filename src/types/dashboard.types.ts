import { Project, Delivery } from './project.types';
import { Milestone } from './milestone.types';
import { Feedback } from './feedback.types';

export interface DeliveryStatusCounts {
  pending: number;
  submitted: number;
  approved: number;
  rejected: number;
}

export interface MilestoneStatusCounts {
  pending: number;
  completed: number;
}

export interface ProjectStatusCounts {
  in_progress: number;
  completed: number;
  cancelled: number;
}

export interface UserTypeCounts {
  student: number;
  advisor: number;
  admin: number;
}

export interface StudentDashboard {
  project: Project | null;
  deliveries: DeliveryStatusCounts;
  milestones: MilestoneStatusCounts;
  upcoming_milestones: Milestone[];
  recent_feedbacks: Feedback[];
  unread_notifications: number;
}

export interface AdvisorDashboard {
  projects: ProjectStatusCounts;
  deliveries_awaiting_feedback: Delivery[];
  overdue_milestones: Milestone[];
  unread_notifications: number;
}

export interface AdminDashboard {
  users: UserTypeCounts;
  projects: ProjectStatusCounts;
  deliveries: DeliveryStatusCounts;
  projects_without_advisor: number;
  overdue_milestones_count: number;
}
