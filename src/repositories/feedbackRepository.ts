import { query, queryOne } from '../config/database';
import { Feedback, CreateFeedbackDTO } from '../types/feedback.types';

export const feedbackRepository = {
  async findByDeliveryId(deliveryId: number): Promise<Feedback[]> {
    return query<Feedback>(
      `SELECT id, delivery_id, advisor_id, comment, grade::float8 AS grade, created_at
       FROM feedbacks
       WHERE delivery_id = $1
       ORDER BY created_at DESC`,
      [deliveryId]
    );
  },

  async create(data: CreateFeedbackDTO): Promise<Feedback> {
    const result = await queryOne<Feedback>(
      `INSERT INTO feedbacks (delivery_id, advisor_id, comment, grade)
       VALUES ($1, $2, $3, $4)
       RETURNING id, delivery_id, advisor_id, comment, grade::float8 AS grade, created_at`,
      [data.delivery_id, data.advisor_id, data.comment, data.grade]
    );
    return result!;
  }
};
