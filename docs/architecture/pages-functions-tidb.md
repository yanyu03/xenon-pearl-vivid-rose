# TiDB through Cloudflare Pages Functions

## Route and database boundary
`functions/api/[[path]].ts` handles `/api/*` requests using the existing Hono `createApp` and `ContentRepository` contract. `src/domain/tidb-pages.ts` adapts the existing parameterized repository SQL to the four `folio_*` TiDB tables. It does not create tables or seed data on requests.

Use **Cloudflare Hyperdrive** with a MySQL/TiDB-compatible connection (TLS enabled). Pages Functions must have a binding named `HYPERDRIVE`; configure it under Pages > Settings > Bindings, then redeploy. The database name is `FreeStudy`. The existing `DATABASE_URL` Secret is NOT consumed by this adapter; do not assume that setting it creates a Hyperdrive binding. Keep secrets out of the repository. Set `ADMIN_PASSWORD` and `SESSION_SECRET` (>=32 chars) for admin.

## Critical integration limitation
This project currently uses TanStack Start + Nitro SSR. Nitro's Cloudflare Pages preset may generate an advanced-mode `_worker.js`, which takes precedence over file-based `/functions`. **Do not claim this API is active just because the files exist.** Before production, inspect build artifacts and ensure `/api/v1/health` and `/api/v1/clusters` are handled by the Pages Function rather than the SSR worker. If `_worker.js` exists, integrate the Hono handler into that worker or separate the UI as static Pages. Do not deploy two competing routing systems.

The existing `src/lib/folio.functions.ts` still reads the memory/file-backed server repository; migrating the frontend data loader to the HTTP API is a separate required task. Never expose the database connection string to client code.

## Smoke checks
1. Confirm `FreeStudy.folio_clusters`, `FreeStudy.folio_entries`, `FreeStudy.folio_callbacks` exist.
2. Configure Hyperdrive connection and `HYPERDRIVE` binding, then redeploy preview.
3. `GET /api/v1/health` -> 200; `GET /api/v1/clusters` -> 200 with database-backed content; unknown slug -> 404.
4. Verify private/draft entries are never publicly returned.
5. Test authenticated CRUD with disposable entries and rollback/cleanup; no production auto-deploy until all pass.

## Security notes
Use a dedicated least-privilege TiDB user. Rotate credentials previously exposed in chat. Avoid showing raw database errors to clients. MySQL driver: `mysql2` >=3.13, `disableEval: true`, `nodejs_compat`.
