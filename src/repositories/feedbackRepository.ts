import { prisma, DbClient } from '../config/prisma';
import { Feedback, CreateFeedbackDTO } from '../types/feedback.types';

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

export const feedbackRepository = {
  async findByDeliveryId(deliveryId: number): Promise<Feedback[]> {
    const rows = await prisma.feedbacks.findMany({
      where: { delivery_id: deliveryId },
      orderBy: { created_at: 'desc' }
    });
    return rows.map(toFeedback);
  },

  async create(data: CreateFeedbackDTO, client: DbClient = prisma): Promise<Feedback> {
    const row = await client.feedbacks.create({
      data: {
        delivery_id: data.delivery_id,
        advisor_id: data.advisor_id,
        comment: data.comment,
        grade: data.grade
      }
    });
    return toFeedback(row);
  }
};
