import { prisma } from '../config/prisma';
import { Feedback, CreateFeedbackDTO } from '../types/feedback.types';

type FeedbackRow = {
  id: number;
  delivery_id: number;
  advisor_id: number;
  comment: string;
  grade: { toNumber(): number } | null;
  created_at: Date;
};

// grade e Decimal no banco; o Prisma representa como Prisma.Decimal, nao
// number puro. O front sempre espera number (equivalente ao grade::float8
// usado na query raw anterior).
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

  async create(data: CreateFeedbackDTO): Promise<Feedback> {
    const row = await prisma.feedbacks.create({
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
