import { Prisma } from '../generated/prisma/client';
import { prisma } from '../config/prisma';
import {
  Delivery,
  DeliveryWithMilestone,
  CreateDeliveryDTO,
  UpdateDeliveryDTO,
  DeliveryStatus
} from '../types/project.types';

/** Prisma's generated delivery_status_enum has the same string values as DeliveryStatus, but is a distinct nominal type. */
function asDelivery<T>(row: T): T & { status: DeliveryStatus } {
  return row as T & { status: DeliveryStatus };
}

export const deliveryRepository = {
  async findAll(): Promise<Delivery[]> {
    const rows = await prisma.deliveries.findMany({ orderBy: { created_at: 'desc' } });
    return rows.map(asDelivery);
  },

  async findById(id: number): Promise<Delivery | null> {
    const row = await prisma.deliveries.findUnique({ where: { id } });
    return row && asDelivery(row);
  },

  async findByProjectId(projectId: number): Promise<DeliveryWithMilestone[]> {
    const rows = await prisma.deliveries.findMany({
      where: { project_id: projectId },
      include: { milestone: { select: { title: true } } },
      orderBy: { created_at: 'desc' }
    });
    return rows.map(({ milestone, ...delivery }) =>
      asDelivery({ ...delivery, milestone_title: milestone?.title ?? null })
    );
  },

  async create(data: CreateDeliveryDTO): Promise<Delivery> {
    const row = await prisma.deliveries.create({
      data: {
        project_id: data.project_id,
        milestone_id: data.milestone_id,
        title: data.title,
        description: data.description,
        deadline: data.deadline ?? null
      }
    });
    return asDelivery(row);
  },

  async update(id: number, data: UpdateDeliveryDTO): Promise<Delivery | null> {
    const updateData: Prisma.deliveriesUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.deadline !== undefined) updateData.deadline = data.deadline;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.file_url !== undefined) updateData.file_url = data.file_url;
    if (data.file_name !== undefined) updateData.file_name = data.file_name;
    if (data.submitted_at !== undefined) updateData.submitted_at = data.submitted_at;

    if (Object.keys(updateData).length === 0) return null;

    const row = await prisma.deliveries.update({ where: { id }, data: updateData });
    return asDelivery(row);
  },

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.deliveries.delete({ where: { id } });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return false;
      throw error;
    }
  }
};
