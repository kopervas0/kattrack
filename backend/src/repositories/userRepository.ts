import { pool } from '../db/pool';
import { AdminUserView, User, UserRole } from '../types';

const SELECT_COLUMNS = `
  id, email, password_hash AS "passwordHash", role,
  is_blocked AS "isBlocked", created_at AS "createdAt"
`;

// Repository layer: the only place in the app that writes raw SQL.
// Services depend on this interface, not on `pg` directly — keeps the
// business logic testable and the SQL centralized.
export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await pool.query(`SELECT ${SELECT_COLUMNS} FROM users WHERE email = $1`, [email]);
    return rows[0] ?? null;
  }

  async findById(id: number): Promise<User | null> {
    const { rows } = await pool.query(`SELECT ${SELECT_COLUMNS} FROM users WHERE id = $1`, [id]);
    return rows[0] ?? null;
  }

  async create(email: string, passwordHash: string): Promise<User> {
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING ${SELECT_COLUMNS}`,
      [email, passwordHash],
    );
    return rows[0];
  }

  async listWithStats(): Promise<AdminUserView[]> {
    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.role, u.is_blocked AS "isBlocked", u.created_at AS "createdAt",
              COUNT(a.id)::int AS "applicationsCount"
       FROM users u
       LEFT JOIN applications a ON a.user_id = u.id
       GROUP BY u.id
       ORDER BY u.created_at DESC, u.id DESC`,
    );
    return rows;
  }

  async setBlocked(id: number, isBlocked: boolean): Promise<boolean> {
    const { rowCount } = await pool.query(`UPDATE users SET is_blocked = $2 WHERE id = $1`, [id, isBlocked]);
    return (rowCount ?? 0) > 0;
  }

  async setRole(id: number, role: UserRole): Promise<boolean> {
    const { rowCount } = await pool.query(`UPDATE users SET role = $2 WHERE id = $1`, [id, role]);
    return (rowCount ?? 0) > 0;
  }

  async delete(id: number): Promise<boolean> {
    const { rowCount } = await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
    return (rowCount ?? 0) > 0;
  }

  async countStats(): Promise<{ total: number; admins: number; blocked: number; newLast7Days: number }> {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE role = 'admin')::int AS admins,
              COUNT(*) FILTER (WHERE is_blocked)::int AS blocked,
              COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS "newLast7Days"
       FROM users`,
    );
    return rows[0];
  }
}
