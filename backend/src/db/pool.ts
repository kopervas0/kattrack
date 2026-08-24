import { Pool } from 'pg';
import { env } from '../config/env';

// A single shared connection pool for the whole app — repositories
// pull connections from here instead of opening their own.
export const pool = new Pool({
  connectionString: env.databaseUrl,
});
