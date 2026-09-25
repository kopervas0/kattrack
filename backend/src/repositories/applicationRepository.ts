import { pool } from '../db/pool';
import { Application, ApplicationStatus, CreateApplicationInput, UpdateApplicationInput } from '../types';

const SELECT_COLUMNS = `
  id, user_id AS "userId", company, position, url, status,
  salary_from AS "salaryFrom", salary_to AS "salaryTo", notes,
  applied_at AS "appliedAt", created_at AS "createdAt", updated_at AS "updatedAt"
`;

export class ApplicationRepository {
  async listByUser(userId: number, status?: ApplicationStatus): Promise<Application[]> {
    if (status) {
      const { rows } = await pool.query(
        `SELECT ${SELECT_COLUMNS} FROM applications
         WHERE user_id = $1 AND status = $2
         ORDER BY applied_at DESC, id DESC`,
        [userId, status],
      );
      return rows;
    }
    const { rows } = await pool.query(
      `SELECT ${SELECT_COLUMNS} FROM applications
       WHERE user_id = $1
       ORDER BY applied_at DESC, id DESC`,
      [userId],
    );
    return rows;
  }

  async findById(id: number, userId: number): Promise<Application | null> {
    const { rows } = await pool.query(
      `SELECT ${SELECT_COLUMNS} FROM applications WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );
    return rows[0] ?? null;
  }

  async create(userId: number, input: CreateApplicationInput): Promise<Application> {
    const { rows } = await pool.query(
      `INSERT INTO applications
         (user_id, company, position, url, status, salary_from, salary_to, notes, applied_at)
       VALUES ($1, $2, $3, $4, COALESCE($5::application_status, 'applied'), $6, $7, $8, COALESCE($9, CURRENT_DATE))
       RETURNING ${SELECT_COLUMNS}`,
      [
        userId,
        input.company,
        input.position,
        input.url ?? null,
        input.status ?? null,
        input.salaryFrom ?? null,
        input.salaryTo ?? null,
        input.notes ?? null,
        input.appliedAt ?? null,
      ],
    );
    return rows[0];
  }

  async update(id: number, userId: number, input: UpdateApplicationInput): Promise<Application | null> {
    const { rows } = await pool.query(
      `UPDATE applications SET
         company     = COALESCE($3, company),
         position    = COALESCE($4, position),
         url         = COALESCE($5, url),
         status      = COALESCE($6, status),
         salary_from = COALESCE($7, salary_from),
         salary_to   = COALESCE($8, salary_to),
         notes       = COALESCE($9, notes),
         applied_at  = COALESCE($10, applied_at),
         updated_at  = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING ${SELECT_COLUMNS}`,
      [
        id,
        userId,
        input.company ?? null,
        input.position ?? null,
        input.url ?? null,
        input.status ?? null,
        input.salaryFrom ?? null,
        input.salaryTo ?? null,
        input.notes ?? null,
        input.appliedAt ?? null,
      ],
    );
    return rows[0] ?? null;
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const { rowCount } = await pool.query(
      `DELETE FROM applications WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );
    return (rowCount ?? 0) > 0;
  }

  async countByUser(userId: number): Promise<number> {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS count FROM applications WHERE user_id = $1`,
      [userId],
    );
    return rows[0].count;
  }

  // System-wide counts for the admin panel (userId = null means "all users").
  async countByStatus(userId: number | null): Promise<Record<ApplicationStatus, number>> {
    const { rows } = await pool.query(
      `SELECT status, COUNT(*)::int AS count
       FROM applications
       WHERE $1::int IS NULL OR user_id = $1
       GROUP BY status`,
      [userId],
    );
    const base: Record<ApplicationStatus, number> = {
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
    };
    for (const row of rows) {
      base[row.status as ApplicationStatus] = row.count;
    }
    return base;
  }
}
