import { prisma } from '../config/prisma';
import { Milestone, MilestoneStatus } from '../types/milestone.types';
import { Feedback } from '../types/feedback.types';
import { DeliveryStatusCounts, MilestoneStatusCounts } from '../types/dashboard.types';

function asMilestone<T>(row: T): T & { status: MilestoneStatus } {
  return row as T & { status: MilestoneStatus };
}

type FeedbackRow = {
  id: number;
  delivery_id: number;
  advisor_id: number;
  comment: string;
  grade: { toNumber(): number } | null;
  created_at: Date;
};

function toFeedback(row: FeedbackRow): Feedback {
  return { ...row, grade: row.grade ? row.grade.toNumber() : 0 };
}

export const studentDashboardRepository = {
  async getDeliveryStatusCounts(projectId: number): Promise<DeliveryStatusCounts> {
    const [pending, submitted, approved, rejected] = await Promise.all([
      prisma.deliveries.count({ where: { project_id: projectId, status: 'pending' } }),
      prisma.deliveries.count({ where: { project_id: projectId, status: 'submitted' } }),
      prisma.deliveries.count({ where: { project_id: projectId, status: 'approved' } }),
      prisma.deliveries.count({ where: { project_id: projectId, status: 'rejected' } })
    ]);
    return { pending, submitted, approved, rejected };
  },

  async getMilestoneStatusCounts(projectId: number): Promise<MilestoneStatusCounts> {
    const [pending, completed] = await Promise.all([
      prisma.milestones.count({ where: { project_id: projectId, status: 'pending' } }),
      prisma.milestones.count({ where: { project_id: projectId, status: 'completed' } })
    ]);
    return { pending, completed };
  },

  // CURRENT_DATE preservado via raw (ver adminDashboardRepository).
  async getUpcomingMilestones(projectId: number, limit: number): Promise<Milestone[]> {
    const rows = await prisma.$queryRaw<Milestone[]>`
      SELECT * FROM milestones
      WHERE project_id = ${projectId} AND status = 'pending' AND due_date >= CURRENT_DATE
      ORDER BY due_date ASC
      LIMIT ${limit}
    `;
    return rows.map(asMilestone);
  },

  async getLatestFeedbacks(projectId: number, limit: number): Promise<Feedback[]> {
    const rows = await prisma.feedbacks.findMany({
      where: { delivery: { project_id: projectId } },
      orderBy: { created_at: 'desc' },
      take: limit
    });
    return rows.map(toFeedback);
  }
};
