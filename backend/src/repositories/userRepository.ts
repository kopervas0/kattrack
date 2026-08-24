import { pool } from '../db/pool';
import { User } from '../types';

// Repository layer: the only place in the app that writes raw SQL.
// Services depend on this interface, not on `pg` directly — keeps the
// business logic testable and the SQL centralized.
export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await pool.query(
      `SELECT id, email, password_hash AS "passwordHash", created_at AS "createdAt"
       FROM users
       WHERE email = $1`,
      [email],
    );
    return rows[0] ?? null;
  }

  async findById(id: number): Promise<User | null> {
    const { rows } = await pool.query(
      `SELECT id, email, password_hash AS "passwordHash", created_at AS "createdAt"
       FROM users
       WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  async create(email: string, passwordHash: string): Promise<User> {
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, password_hash AS "passwordHash", created_at AS "createdAt"`,
      [email, passwordHash],
    );
    return rows[0];
  }
}
