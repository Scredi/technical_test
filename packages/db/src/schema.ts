export const USER_TABLE = `
CREATE TABLE IF NOT EXISTS user (
  uuid TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('administrator', 'formalist_manager', 'formalist', 'account_manager', 'customer', 'support')),
  phone TEXT,
  created_at TEXT,
  changed_at TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('disabled', 'pending', 'enabled', 'active')),
  accepted_terms_on TEXT,
  last_login_on TEXT
);
`

export const FORMALITY_TABLE = `
CREATE TABLE IF NOT EXISTS formality (
  uuid TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('creation', 'modification', 'dépot des comptes')),
  owner_uuid TEXT NOT NULL,
  status TEXT NOT NULL,
  creation_date TEXT NOT NULL,
  modification_date TEXT NOT NULL,
  FOREIGN KEY (owner_uuid) REFERENCES user(uuid)
);

CREATE INDEX IF NOT EXISTS idx_formality_owner ON formality(owner_uuid);
`
