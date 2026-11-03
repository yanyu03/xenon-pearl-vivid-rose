# Preview integration build marker

Branch: `integration/pages-tidb-preview`.

Cloudflare Pages preview deployments are enabled **only** for this branch. Production automatic deployments remain disabled.

Smoke gates: compile; verify `_worker.js` contains Nitro `/api/v1/*` handler; GET `/api/v1/health` and `/api/v1/clusters` must fail closed until `HYPERDRIVE` is bound and TiDB `FreeStudy` is reachable. Do not seed sample articles.
