import { Prisma } from '../generated/prisma/client';
import { prisma } from '../config/prisma';
import {
  Milestone,
  MilestoneWithProject,
  CreateMilestoneDTO,
  UpdateMilestoneDTO,
  MilestoneStatus
} from '../types/milestone.types';

/** Prisma's generated milestone_status_enum has the same string values as MilestoneStatus, but is a distinct nominal type. */
function asMilestone<T>(row: T): T & { status: MilestoneStatus } {
  return row as T & { status: MilestoneStatus };
}

export const milestoneRepository = {
  async findAll(): Promise<Milestone[]> {
    const rows = await prisma.milestones.findMany({ orderBy: { due_date: 'asc' } });
    return rows.map(asMilestone);
  },

  // US14: marcos pendentes vencendo nos proximos 7 dias (due_soon) ou ja
  // vencidos (overdue). O job de notificacao decide o tipo comparando
  // due_date com a data atual. Mantido como SQL raw pela condicao de data
  // em OR, que fica mais direta assim do que no query builder.
  async findDueSoonOrOverdue(): Promise<MilestoneWithProject[]> {
    return prisma.$queryRaw<MilestoneWithProject[]>`
      SELECT m.*,
             p.student_id AS student_id,
             p.advisor_id AS advisor_id,
             p.title AS project_title
      FROM milestones m
      JOIN projects p ON p.id = m.project_id
      WHERE m.status = 'pending'
        AND (
          (m.due_date >= CURRENT_DATE AND m.due_date < CURRENT_DATE + INTERVAL '7 days')
          OR m.due_date < CURRENT_DATE
        )
      ORDER BY m.due_date ASC
    `;
  },

  async findById(id: number): Promise<Milestone | null> {
    const row = await prisma.milestones.findUnique({ where: { id } });
    return row && asMilestone(row);
  },

  async findByProjectId(projectId: number): Promise<Milestone[]> {
    const rows = await prisma.milestones.findMany({
      where: { project_id: projectId },
      orderBy: { due_date: 'asc' }
    });
    return rows.map(asMilestone);
  },

  async create(data: CreateMilestoneDTO): Promise<Milestone> {
    const row = await prisma.milestones.create({
      data: {
        project_id: data.project_id,
        title: data.title,
        description: data.description ?? null,
        due_date: data.due_date ?? null
      }
    });
    return asMilestone(row);
  },

  async update(id: number, data: UpdateMilestoneDTO): Promise<Milestone | null> {
    const updateData: Prisma.milestonesUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.due_date !== undefined) updateData.due_date = data.due_date;
    if (data.status !== undefined) updateData.status = data.status;

    if (Object.keys(updateData).length === 0) return null;

    const row = await prisma.milestones.update({ where: { id }, data: updateData });
    return asMilestone(row);
  },

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.milestones.delete({ where: { id } });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return false;
      throw error;
    }
  }
};
