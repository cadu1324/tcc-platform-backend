import { query, queryOne } from '../config/database';
import { Milestone } from '../types/milestone.types';
import { Feedback } from '../types/feedback.types';
import { DeliveryStatusCounts, MilestoneStatusCounts } from '../types/dashboard.types';

export const studentDashboardRepository = {
  async getDeliveryStatusCounts(projectId: number): Promise<DeliveryStatusCounts> {
    const result = await queryOne<DeliveryStatusCounts>(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
         COUNT(*) FILTER (WHERE status = 'submitted')::int AS submitted,
         COUNT(*) FILTER (WHERE status = 'approved')::int AS approved,
         COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected
       FROM deliveries
       WHERE project_id = $1`,
      [projectId]
    );
    return result!;
  },

  async getMilestoneStatusCounts(projectId: number): Promise<MilestoneStatusCounts> {
    const result = await queryOne<MilestoneStatusCounts>(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
         COUNT(*) FILTER (WHERE status = 'completed')::int AS completed
       FROM milestones
       WHERE project_id = $1`,
      [projectId]
    );
    return result!;
  },

  async getUpcomingMilestones(projectId: number, limit: number): Promise<Milestone[]> {
    return query<Milestone>(
      `SELECT * FROM milestones
       WHERE project_id = $1 AND status = 'pending' AND due_date >= CURRENT_DATE
       ORDER BY due_date ASC
       LIMIT $2`,
      [projectId, limit]
    );
  },

  async getLatestFeedbacks(projectId: number, limit: number): Promise<Feedback[]> {
    return query<Feedback>(
      `SELECT f.id, f.delivery_id, f.advisor_id, f.comment, f.grade::float8 AS grade, f.created_at
       FROM feedbacks f
       JOIN deliveries d ON d.id = f.delivery_id
       WHERE d.project_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2`,
      [projectId, limit]
    );
  }
};
