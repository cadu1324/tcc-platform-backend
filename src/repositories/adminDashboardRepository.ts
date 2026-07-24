import { queryOne } from '../config/database';
import { DeliveryStatusCounts, ProjectStatusCounts, UserTypeCounts } from '../types/dashboard.types';

export const adminDashboardRepository = {
  async getUserCountsByType(): Promise<UserTypeCounts> {
    const result = await queryOne<UserTypeCounts>(
      `SELECT
         COUNT(*) FILTER (WHERE user_type = 'student')::int AS student,
         COUNT(*) FILTER (WHERE user_type = 'advisor')::int AS advisor,
         COUNT(*) FILTER (WHERE user_type = 'admin')::int AS admin
       FROM users`
    );
    return result!;
  },

  async getProjectStatusCounts(): Promise<ProjectStatusCounts> {
    const result = await queryOne<ProjectStatusCounts>(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress,
         COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
         COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled
       FROM projects`
    );
    return result!;
  },

  async getDeliveryStatusCounts(): Promise<DeliveryStatusCounts> {
    const result = await queryOne<DeliveryStatusCounts>(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
         COUNT(*) FILTER (WHERE status = 'submitted')::int AS submitted,
         COUNT(*) FILTER (WHERE status = 'approved')::int AS approved,
         COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected
       FROM deliveries`
    );
    return result!;
  },

  async getProjectsWithoutAdvisorCount(): Promise<number> {
    const result = await queryOne<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM projects WHERE advisor_id IS NULL`
    );
    return result!.count;
  },

  async getOverdueMilestonesCount(): Promise<number> {
    const result = await queryOne<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM milestones WHERE status = 'pending' AND due_date < CURRENT_DATE`
    );
    return result!.count;
  }
};
