import { query, queryOne } from '../config/database';
import {
  Milestone,
  MilestoneWithProject,
  CreateMilestoneDTO,
  UpdateMilestoneDTO
} from '../types/milestone.types';

export const milestoneRepository = {
  async findAll(): Promise<Milestone[]> {
    return query<Milestone>('SELECT * FROM milestones ORDER BY due_date ASC');
  },

  // US14: marcos pendentes vencendo nos proximos 7 dias (due_soon) ou ja
  // vencidos (overdue). O job de notificacao decide o tipo comparando
  // due_date com a data atual.
  async findDueSoonOrOverdue(): Promise<MilestoneWithProject[]> {
    return query<MilestoneWithProject>(
      `SELECT m.*,
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
       ORDER BY m.due_date ASC`
    );
  },

  async findById(id: number): Promise<Milestone | null> {
    return queryOne<Milestone>('SELECT * FROM milestones WHERE id = $1', [id]);
  },

  async findByProjectId(projectId: number): Promise<Milestone[]> {
    return query<Milestone>(
      'SELECT * FROM milestones WHERE project_id = $1 ORDER BY due_date ASC',
      [projectId]
    );
  },

  async create(data: CreateMilestoneDTO): Promise<Milestone> {
    const result = await queryOne<Milestone>(
      `INSERT INTO milestones (project_id, title, description, due_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.project_id, data.title, data.description ?? null, data.due_date ?? null]
    );
    return result!;
  },

  async update(id: number, data: UpdateMilestoneDTO): Promise<Milestone | null> {
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
    if (data.due_date !== undefined) {
      fields.push(`due_date = $${paramIndex++}`);
      values.push(data.due_date);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    return queryOne<Milestone>(
      `UPDATE milestones SET ${fields.join(', ')} WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );
  },

  async delete(id: number): Promise<boolean> {
    const result = await queryOne<{ id: number }>(
      'DELETE FROM milestones WHERE id = $1 RETURNING id',
      [id]
    );
    return !!result;
  }
};
