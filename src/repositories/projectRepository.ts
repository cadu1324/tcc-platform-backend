import { query, queryOne } from '../config/database';
import { Project, CreateProjectDTO, UpdateProjectDTO, ProjectStatus } from '../types/project.types';

export const projectRepository = {
  async findAll(): Promise<Project[]> {
    return query<Project>('SELECT * FROM projects ORDER BY created_at DESC');
  },

  async findById(id: number): Promise<Project | null> {
    return queryOne<Project>('SELECT * FROM projects WHERE id = $1', [id]);
  },

  async findByStudentId(studentId: number): Promise<Project[]> {
    return query<Project>(
      'SELECT * FROM projects WHERE student_id = $1 ORDER BY created_at DESC',
      [studentId]
    );
  },

  async findByAdvisorId(advisorId: number): Promise<Project[]> {
    return query<Project>(
      'SELECT * FROM projects WHERE advisor_id = $1 ORDER BY created_at DESC',
      [advisorId]
    );
  },

  async findByStudentIdAndStatus(studentId: number, status: ProjectStatus): Promise<Project | null> {
    return queryOne<Project>(
      'SELECT * FROM projects WHERE student_id = $1 AND status = $2',
      [studentId, status]
    );
  },

  async create(data: CreateProjectDTO): Promise<Project> {
    const result = await queryOne<Project>(
      `INSERT INTO projects (title, description, student_id, advisor_id, start_date, expected_delivery_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.title,
        data.description,
        data.student_id,
        data.advisor_id ?? null,
        data.start_date ?? null,
        data.expected_delivery_date ?? null
      ]
    );
    return result!;
  },

  async update(id: number, data: UpdateProjectDTO): Promise<Project | null> {
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
    if (data.advisor_id !== undefined) {
      fields.push(`advisor_id = $${paramIndex++}`);
      values.push(data.advisor_id);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }
    if (data.expected_delivery_date !== undefined) {
      fields.push(`expected_delivery_date = $${paramIndex++}`);
      values.push(data.expected_delivery_date);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    return queryOne<Project>(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );
  },

  async delete(id: number): Promise<boolean> {
    const result = await queryOne<{ id: number }>(
      'DELETE FROM projects WHERE id = $1 RETURNING id',
      [id]
    );
    return !!result;
  }
};
