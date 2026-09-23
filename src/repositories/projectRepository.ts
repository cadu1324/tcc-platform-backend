import { Prisma } from '../generated/prisma/client';
import { prisma } from '../config/prisma';
import {
  Project,
  AdvisorProject,
  AdminProject,
  CreateProjectDTO,
  UpdateProjectDTO,
  ProjectStatus
} from '../types/project.types';

/** Prisma's generated project_status_enum has the same string values as ProjectStatus, but is a distinct nominal type. */
function asProject<T>(row: T): T & { status: ProjectStatus } {
  return row as T & { status: ProjectStatus };
}

export const projectRepository = {
  async findAll(): Promise<Project[]> {
    const rows = await prisma.projects.findMany({ orderBy: { created_at: 'desc' } });
    return rows.map(asProject);
  },

  async findById(id: number): Promise<Project | null> {
    const row = await prisma.projects.findUnique({ where: { id } });
    return row && asProject(row);
  },

  async findByStudentId(studentId: number): Promise<Project[]> {
    const rows = await prisma.projects.findMany({
      where: { student_id: studentId },
      orderBy: { created_at: 'desc' }
    });
    return rows.map(asProject);
  },

  async findByAdvisorId(advisorId: number): Promise<Project[]> {
    const rows = await prisma.projects.findMany({
      where: { advisor_id: advisorId },
      orderBy: { created_at: 'desc' }
    });
    return rows.map(asProject);
  },

  // Agregacao com COUNT FILTER mantida como SQL raw via Prisma $queryRaw:
  // mais simples e menos arriscado que reescrever no query builder.
  async findByAdvisorIdWithStats(advisorId: number): Promise<AdvisorProject[]> {
    return prisma.$queryRaw<AdvisorProject[]>`
      SELECT p.*,
             u.name AS student_name,
             COUNT(m.id)::int AS milestones_total,
             (COUNT(m.id) FILTER (WHERE m.status = 'completed'))::int AS milestones_completed
      FROM projects p
      JOIN users u ON u.id = p.student_id
      LEFT JOIN milestones m ON m.project_id = p.id
      WHERE p.advisor_id = ${advisorId}
      GROUP BY p.id, u.name
      ORDER BY p.created_at DESC
    `;
  },

  async findAllWithStats(): Promise<AdminProject[]> {
    return prisma.$queryRaw<AdminProject[]>`
      SELECT p.*,
             student.name AS student_name,
             advisor.name AS advisor_name,
             COUNT(m.id)::int AS milestones_total,
             (COUNT(m.id) FILTER (WHERE m.status = 'completed'))::int AS milestones_completed
      FROM projects p
      JOIN users student ON student.id = p.student_id
      LEFT JOIN users advisor ON advisor.id = p.advisor_id
      LEFT JOIN milestones m ON m.project_id = p.id
      GROUP BY p.id, student.name, advisor.name
      ORDER BY p.created_at DESC
    `;
  },

  async findByStudentIdAndStatus(studentId: number, status: ProjectStatus): Promise<Project | null> {
    const row = await prisma.projects.findFirst({ where: { student_id: studentId, status } });
    return row && asProject(row);
  },

  async create(data: CreateProjectDTO): Promise<Project> {
    const row = await prisma.projects.create({
      data: {
        title: data.title,
        description: data.description,
        student_id: data.student_id,
        advisor_id: data.advisor_id ?? null,
        knowledge_area: data.knowledge_area,
        ...(data.start_date !== undefined && { start_date: data.start_date }),
        expected_delivery_date: data.expected_delivery_date ?? null
      }
    });
    return asProject(row);
  },

  async update(id: number, data: UpdateProjectDTO): Promise<Project | null> {
    const updateData: Prisma.projectsUncheckedUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.advisor_id !== undefined) updateData.advisor_id = data.advisor_id;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.expected_delivery_date !== undefined) updateData.expected_delivery_date = data.expected_delivery_date;
    if (data.knowledge_area !== undefined) updateData.knowledge_area = data.knowledge_area;

    if (Object.keys(updateData).length === 0) return null;

    const row = await prisma.projects.update({ where: { id }, data: updateData });
    return asProject(row);
  },

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.projects.delete({ where: { id } });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return false;
      throw error;
    }
  }
};
