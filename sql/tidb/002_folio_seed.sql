-- Folio seed v1: idempotent, non-destructive, only category metadata.
-- Run in TiDB Cloud SQL Editor AFTER selecting FreeStudy.
-- Never execute against the 'sys' or 'mysql' schema.
USE `FreeStudy`;

CREATE TABLE IF NOT EXISTS folio_schema_migrations (
  version VARCHAR(100) NOT NULL,
  checksum CHAR(64) NOT NULL,
  applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Existing clusters (same slug or same UUID) remain unchanged.
INSERT IGNORE INTO folio_clusters (id, slug, name, blurb, sort_index, created_at) VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000001', 'ai', 'AI 实验', '记录模型与工具链实践。', 0, UTC_TIMESTAMP(3)),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000002', 'engineering', '工程', '项目开发、接口设计与验证。', 1, UTC_TIMESTAMP(3)),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000003', 'essay', '随笔', '观察、复盘与个人记录。', 2, UTC_TIMESTAMP(3)),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000004', 'work', '作品', '已完成或正在维护的项目。', 3, UTC_TIMESTAMP(3));

-- Do not import the fabricated example articles/portfolio from src/lib/content.ts.
-- Real entries must be added after author review through authenticated admin API.
SELECT COUNT(*) AS cluster_count FROM folio_clusters;
SELECT COUNT(*) AS entry_count FROM folio_entries;
SELECT COUNT(*) AS callback_count FROM folio_callbacks;
