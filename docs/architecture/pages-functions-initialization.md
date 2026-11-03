# Cloudflare Pages / TiDB initialization runbook

## Existing state
The production Cloudflare Pages build succeeded at commit `3793fc` on 2026-11-03. The project has no Hyperdrive configuration yet; `DATABASE_URL` is stored as a Pages secret and **cannot be turned into a Hyperdrive resource automatically**. The known database is **FreeStudy**, with `folio_clusters`, `folio_entries` and `folio_callbacks` already present. Do not recreate or drop data.

## Routing
Nitro's `cloudflare_pages` preset emits `_worker.js` (advanced Pages Functions). Cloudflare ignores root `/functions` in advanced mode. The active Hono API integration is `server/middleware/00.folio-api.ts`, bound at `/api/v1/*` by Nitro, reusing `src/domain/tidb-pages.ts` and `ContentRepository`. The original `functions/api/[[path]].ts` is a reference entry for a future file-based/static Pages build, not a second deployed route.

Public SSR loaders now request the same-origin API; they must not fall back to local demo memory on production. Any 503 means no database, rather than silently returning sample content.

## Bind Hyperdrive
1. In Cloudflare Hyperdrive, create an **external MySQL-compatible** connection using the **rotated** TiDB Cloud credentials, host, TCP port 4000, database `FreeStudy`, and certificate validation (TLS required). Avoid pasting credentials in GitHub.
2. In Pages > `xblog-modern` > Settings > Bindings add a **Hyperdrive** binding named `HYPERDRIVE`, referencing the created Hyperdrive config, for production and preview as required. Redeploy the commit after binding.
3. Configure `ADMIN_PASSWORD` and `SESSION_SECRET` (>=32 random chars) as Cloudflare Pages **secrets** for admin write endpoints. Keep production auto-deploy disabled until smoke tests pass.
4. Confirm GET `/api/v1/health` (200), GET `/api/v1/clusters` (200 with cluster records), and GET `/api/v1/entries/missing-slug` (404). Check SSR renders the same counts. Health alone is not proof of TiDB connectivity; the clusters query must pass.

## Initialization
Run `sql/tidb/001_folio_core.sql` only if schema tables are missing. Run `sql/tidb/002_folio_seed.sql` in the TiDB Cloud **FreeStudy** SQL editor; it only inserts missing category records, without deleting or overwriting records. The existing sample `src/lib/content.ts` contains fictional artwork and case-study data and must **not** be publicly seeded as authentic works.

## Validation & safety
- Inspect `SHOW TABLES;`, counts, API responses; confirm private/draft entries never appear in public queries.
- Test admin create/edit/publish/delete with a clearly labeled test draft, then clean up.
- Avoid running seed/migrations inside `npm run build` or on every request.
- Rotate credentials previously exposed in chat; use least privilege; never echo credentials or raw DB exceptions.
