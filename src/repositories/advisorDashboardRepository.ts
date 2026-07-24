import { query, queryOne } from '../config/database';
import { Delivery } from '../types/project.types';
import { Milestone } from '../types/milestone.types';
import { ProjectStatusCounts } from '../types/dashboard.types';

export const advisorDashboardRepository = {
  async getProjectStatusCounts(advisorId: number): Promise<ProjectStatusCounts> {
    const result = await queryOne<ProjectStatusCounts>(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress,
         COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
         COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled
       FROM projects
       WHERE advisor_id = $1`,
      [advisorId]
    );
    return result!;
  },

  async getDeliveriesAwaitingFeedback(advisorId: number, limit: number): Promise<Delivery[]> {
    return query<Delivery>(
      `SELECT d.* FROM deliveries d
       JOIN projects p ON p.id = d.project_id
       LEFT JOIN feedbacks f ON f.delivery_id = d.id
       WHERE p.advisor_id = $1 AND d.status = 'submitted' AND f.id IS NULL
       ORDER BY d.submitted_at ASC
       LIMIT $2`,
      [advisorId, limit]
    );
  },

  async getOverdueMilestones(advisorId: number, limit: number): Promise<Milestone[]> {
    return query<Milestone>(
      `SELECT m.* FROM milestones m
       JOIN projects p ON p.id = m.project_id
       WHERE p.advisor_id = $1 AND m.status = 'pending' AND m.due_date < CURRENT_DATE
       ORDER BY m.due_date ASC
       LIMIT $2`,
      [advisorId, limit]
    );
  }
};
