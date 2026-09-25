-- KatTrack schema — plain SQL (no ORM), to demonstrate direct SQL / query design skills.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(16) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_blocked    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE application_status AS ENUM (
  'applied',
  'interview',
  'offer',
  'rejected'
);

CREATE TABLE IF NOT EXISTS applications (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company       VARCHAR(255) NOT NULL,
  position      VARCHAR(255) NOT NULL,
  url           VARCHAR(1024),
  status        application_status NOT NULL DEFAULT 'applied',
  salary_from   INTEGER,
  salary_to     INTEGER,
  notes         TEXT,
  applied_at    DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Every dashboard query filters by user and usually by status too,
-- so a composite index keeps the common "my applications by status" query fast.
CREATE INDEX IF NOT EXISTS idx_applications_user_status
  ON applications (user_id, status);

CREATE INDEX IF NOT EXISTS idx_applications_user_applied_at
  ON applications (user_id, applied_at DESC);

-- System-wide settings editable by administrators (key/value, values stored as text).
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
