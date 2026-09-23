import { prisma } from '../config/prisma';
import { Delivery, DeliveryStatus } from '../types/project.types';
import { Milestone, MilestoneStatus } from '../types/milestone.types';
import { ProjectStatusCounts } from '../types/dashboard.types';

function asDelivery<T>(row: T): T & { status: DeliveryStatus } {
  return row as T & { status: DeliveryStatus };
}

function asMilestone<T>(row: T): T & { status: MilestoneStatus } {
  return row as T & { status: MilestoneStatus };
}

export const advisorDashboardRepository = {
  async getProjectStatusCounts(advisorId: number): Promise<ProjectStatusCounts> {
    const [in_progress, completed, cancelled] = await Promise.all([
      prisma.projects.count({ where: { advisor_id: advisorId, status: 'in_progress' } }),
      prisma.projects.count({ where: { advisor_id: advisorId, status: 'completed' } }),
      prisma.projects.count({ where: { advisor_id: advisorId, status: 'cancelled' } })
    ]);
    return { in_progress, completed, cancelled };
  },

  async getDeliveriesAwaitingFeedback(advisorId: number, limit: number): Promise<Delivery[]> {
    const rows = await prisma.deliveries.findMany({
      where: {
        status: 'submitted',
        project: { advisor_id: advisorId },
        feedbacks: { none: {} }
      },
      orderBy: { submitted_at: 'asc' },
      take: limit
    });
    return rows.map(asDelivery);
  },

  // CURRENT_DATE preservado via raw (ver adminDashboardRepository).
  async getOverdueMilestones(advisorId: number, limit: number): Promise<Milestone[]> {
    const rows = await prisma.$queryRaw<Milestone[]>`
      SELECT m.* FROM milestones m
      JOIN projects p ON p.id = m.project_id
      WHERE p.advisor_id = ${advisorId} AND m.status = 'pending' AND m.due_date < CURRENT_DATE
      ORDER BY m.due_date ASC
      LIMIT ${limit}
    `;
    return rows.map(asMilestone);
  }
};
