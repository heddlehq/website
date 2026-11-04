CREATE TABLE signups (
  email TEXT PRIMARY KEY,
  lang TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
