import { defineHandler } from "nitro";
import { handlePagesApi, type PagesEnv } from "../../src/domain/tidb-pages";

/**
 * Nitro Cloudflare Pages preset emits _worker.js (Pages Functions advanced mode).
 * In advanced mode Cloudflare ignores /functions, so route the existing Hono API
 * from Nitro itself. This handler is deliberately limited to /api/v1/*.
 */
export default defineHandler(async (event) => {
  if (!event.url.pathname.startsWith("/api/v1/")) return;
  const cloudflare = event.req.runtime?.cloudflare as { env?: PagesEnv } | undefined;
  if (!cloudflare?.env) {
    return Response.json({ error: "Cloudflare runtime binding unavailable" }, { status: 503 });
  }
  try {
    return await handlePagesApi(event.req, cloudflare.env);
  } catch (error) {
    console.error("[folio] API failed", error instanceof Error ? error.name : "unknown");
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }
});
