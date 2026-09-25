import bcrypt from 'bcryptjs';
import { pool } from './pool';
import { env } from '../config/env';

// schema.sql only runs when the Postgres volume is created for the first time.
// These statements are idempotent, so they bring an older database up to date
// on every start without breaking a fresh one.
const MIGRATIONS = `
  ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(16) NOT NULL DEFAULT 'user';
  ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT FALSE;

  CREATE TABLE IF NOT EXISTS settings (
    key        VARCHAR(64) PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  INSERT INTO settings (key, value) VALUES
    ('registration_enabled', 'true'),
    ('max_applications_per_user', '0'),
    ('announcement', '')
  ON CONFLICT (key) DO NOTHING;
`;

export async function migrate() {
  await pool.query(MIGRATIONS);
  await seedAdmin();
}

// Creates the first administrator from ADMIN_EMAIL / ADMIN_PASSWORD.
// If the user already exists it is only promoted to admin; the password is left untouched.
async function seedAdmin() {
  if (!env.adminEmail || !env.adminPassword) {
    return;
  }
  const passwordHash = await bcrypt.hash(env.adminPassword, 10);
  await pool.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, 'admin')
     ON CONFLICT (email) DO UPDATE SET role = 'admin', is_blocked = FALSE`,
    [env.adminEmail, passwordHash],
  );
}
