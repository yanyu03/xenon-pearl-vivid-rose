import { Hono } from "hono";
import { openSession, passwordMatches, sealSession, signWebhook } from "@/domain/crypto";
import type { ContentRepository, EntryInput } from "@/domain/repository";
import type { EntryRow, Secrets } from "@/domain/types";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function requestId(): string {
  return crypto.randomUUID();
}

function envelope(data: unknown, status = 200): Response {
  return Response.json(
    { data, meta: { requestId: requestId(), generatedAt: new Date().toISOString() } },
    {
      status,
      headers: { "cache-control": "no-store" },
    },
  );
}

function problem(status: number, title: string, detail: string): Response {
  return Response.json(
    { type: "about:blank", title, status, detail },
    {
      status,
      headers: { "content-type": "application/problem+json; charset=utf-8" },
    },
  );
}

function bearer(header: string | undefined): string {
  if (!header) return "";
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return "";
  return token;
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function str(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

function entryInput(body: Record<string, unknown>, partial: boolean): Partial<EntryInput> | Response {
  const input: Partial<EntryInput> = {};
  if ("slug" in body || !partial) {
    const slug = str(body.slug, 64);
    if (!slug || !SLUG.test(slug)) return problem(422, "Unprocessable Content", "slug 需为小写英文与连字符。");
    input.slug = slug;
  }
  if ("kind" in body || !partial) {
    if (body.kind !== "note" && body.kind !== "work") {
      return problem(422, "Unprocessable Content", "kind 只能是 note 或 work。");
    }
    input.kind = body.kind;
  }
  if ("title" in body || !partial) {
    const title = str(body.title, 120);
    if (!title) return problem(422, "Unprocessable Content", "标题不能为空。");
    input.title = title;
  }
  if ("dek" in body || !partial) {
    const dek = str(body.dek, 280);
    if (!dek) return problem(422, "Unprocessable Content", "摘要不能为空。");
    input.dek = dek;
  }
  if ("clusterId" in body || !partial) {
    const clusterId = str(body.clusterId, 64);
    if (!clusterId) return problem(422, "Unprocessable Content", "需要指定聚类。");
    input.clusterId = clusterId;
  }
  if ("visibility" in body || !partial) {
    if (body.visibility !== "public" && body.visibility !== "private") {
      return problem(422, "Unprocessable Content", "visibility 只能是 public 或 private。");
    }
    input.visibility = body.visibility;
  }
  if ("status" in body || !partial) {
    if (body.status !== "draft" && body.status !== "published") {
      return problem(422, "Unprocessable Content", "status 只能是 draft 或 published。");
    }
    input.status = body.status;
  }
  if (typeof body.cover === "string") input.cover = body.cover.slice(0, 240);
  if (typeof body.coverAlt === "string") input.coverAlt = body.coverAlt.slice(0, 160);
  if (typeof body.year === "string") input.year = body.year.slice(0, 8);
  if (typeof body.role === "string") input.role = body.role.slice(0, 80);
  if (typeof body.outcome === "string") input.outcome = body.outcome.slice(0, 160);
  if (typeof body.featured === "boolean") input.featured = body.featured;
  if (typeof body.readingMinutes === "number" && body.readingMinutes > 0 && body.readingMinutes < 120) {
    input.readingMinutes = Math.round(body.readingMinutes);
  }
  if (Array.isArray(body.tags)) {
    input.tags = body.tags.filter((tag): tag is string => typeof tag === "string").slice(0, 8);
  }
  if (typeof body.bodyText === "string") {
    input.body = body.bodyText
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 40)
      .map((text) => ({ type: "p" as const, text }));
  }
  return input;
}

function defaults(input: Partial<EntryInput>): EntryInput | null {
  if (!input.slug || !input.kind || !input.title || !input.dek || !input.clusterId) return null;
  if (!input.visibility || !input.status) return null;
  return {
    slug: input.slug,
    kind: input.kind,
    title: input.title,
    dek: input.dek,
    cover: input.cover || "/images/hero-desk.jpg",
    coverAlt: input.coverAlt || input.title,
    body: input.body ?? [{ type: "p", text: input.dek }],
    clusterId: input.clusterId,
    visibility: input.visibility,
    status: input.status,
    readingMinutes: input.readingMinutes ?? 5,
    featured: input.featured ?? false,
    tags: input.tags ?? [],
    year: input.year ?? "",
    role: input.role ?? "",
    outcome: input.outcome ?? "",
  };
}

/** CloudEvents 1.0 structured-mode callback. */
async function emitPublished(repo: ContentRepository, secrets: Secrets, entry: EntryRow) {
  const event = {
    specversion: "1.0",
    id: crypto.randomUUID(),
    source: "https://folio.dev/api/v1",
    type: "folio.entry.published",
    time: new Date().toISOString(),
    datacontenttype: "application/json",
    data: {
      id: entry.id,
      slug: entry.slug,
      kind: entry.kind,
      title: entry.title,
      visibility: entry.visibility,
      status: entry.status,
    },
  };
  const body = JSON.stringify(event);
  if (!secrets.webhookUrl) {
    await repo.addCallback({
      id: event.id,
      entryId: entry.id,
      eventType: event.type,
      targetUrl: "",
      statusCode: null,
      ok: false,
      detail: "WEBHOOK_URL 未配置，回传已记录但未发送。",
      createdAt: event.time,
    });
    return;
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = secrets.webhookSecret
    ? await signWebhook(body, secrets.webhookSecret, timestamp)
    : "";
  try {
    const response = await fetch(secrets.webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/cloudevents+json",
        "x-folio-signature": signature,
        "x-folio-timestamp": String(timestamp),
      },
      body,
    });
    await repo.addCallback({
      id: event.id,
      entryId: entry.id,
      eventType: event.type,
      targetUrl: secrets.webhookUrl,
      statusCode: response.status,
      ok: response.ok,
      detail: response.ok ? "delivered" : `upstream ${response.status}`,
      createdAt: event.time,
    });
  } catch (error) {
    await repo.addCallback({
      id: event.id,
      entryId: entry.id,
      eventType: event.type,
      targetUrl: secrets.webhookUrl,
      statusCode: null,
      ok: false,
      detail: error instanceof Error ? error.message : "callback failed",
      createdAt: event.time,
    });
  }
}

export function createApp(repo: ContentRepository, secrets: Secrets) {
  const app = new Hono();

  app.use("*", async (c, next) => {
    await next();
    if (!secrets.corsOrigin) return;
    c.res.headers.set("access-control-allow-origin", secrets.corsOrigin);
    c.res.headers.set("access-control-allow-headers", "authorization, content-type");
    c.res.headers.set("access-control-allow-methods", "GET, POST, PATCH, DELETE, OPTIONS");
    c.res.headers.set("vary", "Origin");
  });

  app.options("/api/v1/*", () => new Response(null, { status: 204 }));

  app.get("/api/v1/health", (c) =>
    c.json({
      data: {
        name: "folio",
        protocol: "folio.v1",
        standards: [
          "RFC 8259",
          "RFC 9457",
          "RFC 5869",
          "NIST SP 800-38D",
          "RFC 2104",
          "CloudEvents 1.0",
          "ISO 8601",
          "RFC 4122",
        ],
      },
      meta: { requestId: requestId(), generatedAt: new Date().toISOString() },
    }),
  );

  app.get("/api/v1/clusters", async (c) => {
    const data = await repo.board();
    return c.json(
      { data, meta: { requestId: requestId(), generatedAt: new Date().toISOString() } },
      200,
      { "cache-control": "public, max-age=30" },
    );
  });

  app.get("/api/v1/entries/:slug", async (c) => {
    const entry = await repo.publicBySlug(c.req.param("slug"));
    if (!entry) return problem(404, "Not Found", "这篇还没有公开。");
    return envelope(entry);
  });

  app.post("/api/v1/admin/session", async (c) => {
    if (secrets.requireSecrets && (secrets.sessionSecret.length < 32 || !secrets.adminPassword)) {
      return problem(503, "Service Unavailable", "请在 Cloudflare 配置 ADMIN_PASSWORD 与 SESSION_SECRET。");
    }
    const body = (await readJson(c.req.raw)) as { password?: string } | null;
    const password = body?.password ?? "";
    const ok = await passwordMatches(password, secrets.adminPassword);
    if (!ok) return problem(401, "Unauthorized", "口令不正确。");
    const now = Math.floor(Date.now() / 1000);
    const token = await sealSession(
      { sub: "admin", iat: now, exp: now + secrets.ttlSeconds, jti: crypto.randomUUID() },
      secrets.sessionSecret,
    );
    return envelope({ token, tokenType: "Bearer", expiresAt: new Date((now + secrets.ttlSeconds) * 1000).toISOString() });
  });

  app.use("/api/v1/admin/*", async (c, next) => {
    if (c.req.path === "/api/v1/admin/session" && c.req.method === "POST") return next();
    if (secrets.requireSecrets && secrets.sessionSecret.length < 32) {
      return problem(503, "Service Unavailable", "SESSION_SECRET 未配置。");
    }
    const claims = await openSession(bearer(c.req.header("authorization")), secrets.sessionSecret);
    if (!claims) return problem(401, "Unauthorized", "登录已失效。");
    await next();
  });

  app.get("/api/v1/admin/overview", async () => {
    const [clusters, entries, callbacks] = await Promise.all([
      repo.adminClusters(),
      repo.adminEntries(),
      repo.callbacks(),
    ]);
    return envelope({
      clusters: clusters.length,
      entries: entries.length,
      published: entries.filter((item) => item.status === "published" && item.visibility === "public").length,
      drafts: entries.filter((item) => item.status === "draft" || item.visibility === "private").length,
      callbacks: callbacks.slice(0, 8),
    });
  });

  app.get("/api/v1/admin/clusters", async () => envelope(await repo.adminClusters()));

  app.post("/api/v1/admin/clusters", async (c) => {
    const body = (await readJson(c.req.raw)) as Record<string, unknown> | null;
    if (!body) return problem(400, "Bad Request", "需要 JSON 正文。");
    const slug = str(body.slug, 64);
    const name = str(body.name, 40);
    const blurb = typeof body.blurb === "string" ? body.blurb.slice(0, 160) : "";
    if (!slug || !SLUG.test(slug) || !name) return problem(422, "Unprocessable Content", "聚类需要名称和合法 slug。");
    try {
      return envelope(await repo.createCluster({ slug, name, blurb }), 201);
    } catch (error) {
      if (error instanceof Error && error.message === "slug-taken") {
        return problem(409, "Conflict", "这个 slug 已经存在。");
      }
      throw error;
    }
  });

  app.patch("/api/v1/admin/clusters/:id", async (c) => {
    const body = (await readJson(c.req.raw)) as Record<string, unknown> | null;
    if (!body) return problem(400, "Bad Request", "需要 JSON 正文。");
    const patch: Partial<{ slug: string; name: string; blurb: string; sortIndex: number }> = {};
    if ("slug" in body) {
      const slug = str(body.slug, 64);
      if (!slug || !SLUG.test(slug)) return problem(422, "Unprocessable Content", "slug 不合法。");
      patch.slug = slug;
    }
    if ("name" in body) {
      const name = str(body.name, 40);
      if (!name) return problem(422, "Unprocessable Content", "名称不能为空。");
      patch.name = name;
    }
    if (typeof body.blurb === "string") patch.blurb = body.blurb.slice(0, 160);
    if (typeof body.sortIndex === "number") patch.sortIndex = body.sortIndex;
    try {
      const row = await repo.updateCluster(c.req.param("id"), patch);
      if (!row) return problem(404, "Not Found", "聚类不存在。");
      return envelope(row);
    } catch (error) {
      if (error instanceof Error && error.message === "slug-taken") {
        return problem(409, "Conflict", "这个 slug 已经存在。");
      }
      throw error;
    }
  });

  app.delete("/api/v1/admin/clusters/:id", async (c) => {
    const result = await repo.deleteCluster(c.req.param("id"));
    if (result === "missing") return problem(404, "Not Found", "聚类不存在。");
    if (result === "not-empty") return problem(409, "Conflict", "聚类里还有卡片，先移走再删除。");
    return envelope({ deleted: true });
  });

  app.get("/api/v1/admin/entries", async () => envelope(await repo.adminEntries()));

  app.post("/api/v1/admin/entries", async (c) => {
    const body = (await readJson(c.req.raw)) as Record<string, unknown> | null;
    if (!body) return problem(400, "Bad Request", "需要 JSON 正文。");
    const parsed = entryInput(body, false);
    if (parsed instanceof Response) return parsed;
    const input = defaults(parsed);
    if (!input) return problem(422, "Unprocessable Content", "条目字段不完整。");
    try {
      return envelope(await repo.createEntry(input), 201);
    } catch (error) {
      return mapRepoError(error);
    }
  });

  app.patch("/api/v1/admin/entries/:id", async (c) => {
    const body = (await readJson(c.req.raw)) as Record<string, unknown> | null;
    if (!body) return problem(400, "Bad Request", "需要 JSON 正文。");
    const parsed = entryInput(body, true);
    if (parsed instanceof Response) return parsed;
    try {
      const row = await repo.updateEntry(c.req.param("id"), parsed);
      if (!row) return problem(404, "Not Found", "条目不存在。");
      return envelope(row);
    } catch (error) {
      return mapRepoError(error);
    }
  });

  app.delete("/api/v1/admin/entries/:id", async (c) => {
    const ok = await repo.deleteEntry(c.req.param("id"));
    if (!ok) return problem(404, "Not Found", "条目不存在。");
    return envelope({ deleted: true });
  });

  app.post("/api/v1/admin/entries/:id/publish", async (c) => {
    const row = await repo.publish(c.req.param("id"));
    if (!row) return problem(404, "Not Found", "条目不存在。");
    await emitPublished(repo, secrets, row);
    return envelope(row);
  });

  app.get("/api/v1/admin/callbacks", async () => envelope(await repo.callbacks()));

  app.notFound(() => problem(404, "Not Found", "没有这个接口。"));
  app.onError((error) => {
    console.error("[folio-api]", error);
    return problem(500, "Internal Server Error", "接口暂时不可用。");
  });

  return app;
}

function mapRepoError(error: unknown): Response {
  if (error instanceof Error && error.message === "slug-taken") {
    return problem(409, "Conflict", "这个 slug 已经存在。");
  }
  if (error instanceof Error && error.message === "cluster-missing") {
    return problem(422, "Unprocessable Content", "聚类不存在。");
  }
  throw error;
}
