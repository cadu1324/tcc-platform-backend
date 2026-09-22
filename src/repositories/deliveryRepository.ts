import { query, queryOne } from '../config/database';
import {
  Delivery,
  DeliveryWithMilestone,
  CreateDeliveryDTO,
  UpdateDeliveryDTO
} from '../types/project.types';

export const deliveryRepository = {
  async findAll(): Promise<Delivery[]> {
    return query<Delivery>('SELECT * FROM deliveries ORDER BY created_at DESC');
  },

  async findById(id: number): Promise<Delivery | null> {
    return queryOne<Delivery>('SELECT * FROM deliveries WHERE id = $1', [id]);
  },

  async findByProjectId(projectId: number): Promise<DeliveryWithMilestone[]> {
    return query<DeliveryWithMilestone>(
      `SELECT d.*, m.title AS milestone_title
       FROM deliveries d
       LEFT JOIN milestones m ON m.id = d.milestone_id
       WHERE d.project_id = $1
       ORDER BY d.created_at DESC`,
      [projectId]
    );
  },

  async create(data: CreateDeliveryDTO): Promise<Delivery> {
    const result = await queryOne<Delivery>(
      `INSERT INTO deliveries (project_id, milestone_id, title, description, deadline)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.project_id, data.milestone_id, data.title, data.description, data.deadline ?? null]
    );
    return result!;
  },

  async update(id: number, data: UpdateDeliveryDTO): Promise<Delivery | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.deadline !== undefined) {
      fields.push(`deadline = $${paramIndex++}`);
      values.push(data.deadline);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }
    if (data.file_url !== undefined) {
      fields.push(`file_url = $${paramIndex++}`);
      values.push(data.file_url);
    }
    if (data.file_name !== undefined) {
      fields.push(`file_name = $${paramIndex++}`);
      values.push(data.file_name);
    }
    if (data.submitted_at !== undefined) {
      fields.push(`submitted_at = $${paramIndex++}`);
      values.push(data.submitted_at);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    return queryOne<Delivery>(
      `UPDATE deliveries SET ${fields.join(', ')} WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );
  },

  async delete(id: number): Promise<boolean> {
    const result = await queryOne<{ id: number }>(
      'DELETE FROM deliveries WHERE id = $1 RETURNING id',
      [id]
    );
    return !!result;
  }
};
