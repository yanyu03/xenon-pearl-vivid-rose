# Folio frontend/backend separation · TiDB v1

## Existing contract (verified in repository)
- Frontend: TanStack Start / React routes. It must consume a versioned HTTP API; never import DB drivers or secrets into client bundles.
- Backend: Hono `createApp(repo, secrets)` under `src/domain/http.ts`, currently exposed by `src/worker.ts` (D1) or `src/domain/node-handler.server.ts` (memory/file).
- Repository contract: `ContentRepository` in `src/domain/repository.ts`; public `board()`, `publicBySlug()`; admin CRUD and callback audit.
- Existing `src/lib/db.ts` and `scripts/migrate.mjs` use PostgreSQL, NOT TiDB. Do not point these at the TiDB URL.

## Deployment target
```
Browser -> Cloudflare Pages (React UI)
                 |
                 +-- /api/v1/* -> Hono Worker (same-origin route/proxy)
                                      |
                               ContentRepository
                                      |
                               TiDBRepository
                                      |
                        TiDB Cloud (MySQL protocol, TLS)
```
Prefer separate API Worker service with a same-origin Pages route; avoid cross-origin cookies and CORS complexity. Use a compatible Worker MySQL driver or Cloudflare Hyperdrive; verify runtime compatibility before selecting. No secrets in frontend or Git.

## Environment contract
- `DB_PROVIDER=tidb` (production default)
- `DATABASE_URL`: secret, MySQL URI `mysql://USER:PASSWORD@HOST:4000/APP_DB` with TLS identity verification. JDBC URL is not a directly usable JS driver URL.
- `ADMIN_PASSWORD`, `SESSION_SECRET`: secrets required before enabling admin; admin UI flag is not server authorization.
- `CORS_ORIGIN`: explicit origin if API is hosted separately.
- No PGlite or memory fallback in production: fail closed when DB unavailable.

## Schema v1
See `sql/tidb/001_folio_core.sql`. Mirrors current `ClusterRow`, `EntryRow`, `CallbackRow`. JSON body/tags preserve existing frontend data contracts. Indexes serve public listing, slug lookup, admin cluster and recent callback queries. No comment table: comments are disabled. No fabricated user/auth tables: current admin uses password+signed session.

## Migration and safety gates
1. Create dedicated TiDB application database/user with least privileges (provided URL currently names `sys`; do not run schema against it blindly).
2. Translate existing D1 repository operations to a TiDB adapter with parameterized queries; retain `ContentRepository` interface.
3. Separate SQL migrations from `npm run build`; run explicit versioned migrations with checksum, backup, idempotence and dry run.
4. Import seed data only after confirming target is empty; never auto-seed on every request.
5. Test draft/private exclusion, published filtering, slug uniqueness, CRUD authorization, callback audit, and unavailable DB fail-closed behavior.
6. Test Pages/Worker build and deploy a preview before enabling production auto deploy.

## Status
This commit is schema and architecture design ONLY. No database changes, TiDB connectivity test, runtime adapter, or production deployment are claimed.
