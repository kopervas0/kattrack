import { pool } from '../db/pool';
import { AppSettings } from '../types';

// Settings live in a key/value table; this repository maps them to a typed object.
const KEYS: Record<keyof AppSettings, string> = {
  registrationEnabled: 'registration_enabled',
  maxApplicationsPerUser: 'max_applications_per_user',
  announcement: 'announcement',
};

export class SettingsRepository {
  async getAll(): Promise<AppSettings> {
    const { rows } = await pool.query<{ key: string; value: string }>(`SELECT key, value FROM settings`);
    const map = new Map(rows.map((row) => [row.key, row.value]));
    return {
      registrationEnabled: (map.get(KEYS.registrationEnabled) ?? 'true') === 'true',
      maxApplicationsPerUser: Number(map.get(KEYS.maxApplicationsPerUser) ?? 0),
      announcement: map.get(KEYS.announcement) ?? '',
    };
  }

  async update(patch: Partial<AppSettings>): Promise<AppSettings> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [field, value] of Object.entries(patch)) {
        const key = KEYS[field as keyof AppSettings];
        if (!key || value === undefined) continue;
        await client.query(
          `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, NOW())
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
          [key, String(value)],
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    return this.getAll();
  }
}
