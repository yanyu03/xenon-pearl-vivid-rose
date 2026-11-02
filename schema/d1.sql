CREATE TABLE IF NOT EXISTS clusters (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  blurb TEXT NOT NULL DEFAULT '',
  sort_index INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  dek TEXT NOT NULL,
  cover TEXT NOT NULL,
  cover_alt TEXT NOT NULL,
  body_json TEXT NOT NULL,
  cluster_id TEXT NOT NULL,
  visibility TEXT NOT NULL,
  status TEXT NOT NULL,
  published_at TEXT,
  reading_minutes INTEGER NOT NULL DEFAULT 5,
  featured INTEGER NOT NULL DEFAULT 0,
  tags_json TEXT NOT NULL DEFAULT '[]',
  year TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  outcome TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS callbacks (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  target_url TEXT NOT NULL,
  status_code INTEGER,
  ok INTEGER NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS entries_cluster_idx ON entries (cluster_id);
CREATE INDEX IF NOT EXISTS entries_public_idx ON entries (visibility, status);
