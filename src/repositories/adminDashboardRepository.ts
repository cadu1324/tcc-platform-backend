import { prisma } from '../config/prisma';
import { DeliveryStatusCounts, ProjectStatusCounts, UserTypeCounts } from '../types/dashboard.types';

export const adminDashboardRepository = {
  async getUserCountsByType(): Promise<UserTypeCounts> {
    const [student, advisor, admin] = await Promise.all([
      prisma.users.count({ where: { user_type: 'student' } }),
      prisma.users.count({ where: { user_type: 'advisor' } }),
      prisma.users.count({ where: { user_type: 'admin' } })
    ]);
    return { student, advisor, admin };
  },

  async getProjectStatusCounts(): Promise<ProjectStatusCounts> {
    const [in_progress, completed, cancelled] = await Promise.all([
      prisma.projects.count({ where: { status: 'in_progress' } }),
      prisma.projects.count({ where: { status: 'completed' } }),
      prisma.projects.count({ where: { status: 'cancelled' } })
    ]);
    return { in_progress, completed, cancelled };
  },

  async getDeliveryStatusCounts(): Promise<DeliveryStatusCounts> {
    const [pending, submitted, approved, rejected] = await Promise.all([
      prisma.deliveries.count({ where: { status: 'pending' } }),
      prisma.deliveries.count({ where: { status: 'submitted' } }),
      prisma.deliveries.count({ where: { status: 'approved' } }),
      prisma.deliveries.count({ where: { status: 'rejected' } })
    ]);
    return { pending, submitted, approved, rejected };
  },

  async getProjectsWithoutAdvisorCount(): Promise<number> {
    return prisma.projects.count({ where: { advisor_id: null } });
  },

  // CURRENT_DATE (limite de meia-noite no Postgres) preservado via raw:
  // comparar com "new Date()" no JS classificaria um marco que vence mais
  // cedo hoje como atrasado, o que CURRENT_DATE nao faz.
  async getOverdueMilestonesCount(): Promise<number> {
    const [{ count }] = await prisma.$queryRaw<[{ count: number }]>`
      SELECT COUNT(*)::int AS count FROM milestones
      WHERE status = 'pending' AND due_date < CURRENT_DATE
    `;
    return count;
  }
};
