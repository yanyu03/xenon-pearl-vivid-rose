import { createApp } from "@/domain/http";
import { D1Repository, type SqlDatabase } from "@/domain/repository";
import type { Secrets } from "@/domain/types";

export interface Env {
  DB: SqlDatabase;
  ADMIN_PASSWORD?: string;
  SESSION_SECRET?: string;
  WEBHOOK_URL?: string;
  WEBHOOK_SECRET?: string;
  TOKEN_TTL_SECONDS?: string;
  CORS_ORIGIN?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const repo = new D1Repository(env.DB);
    await repo.migrate();
    const secrets: Secrets = {
      adminPassword: env.ADMIN_PASSWORD ?? "",
      sessionSecret: env.SESSION_SECRET ?? "",
      webhookUrl: env.WEBHOOK_URL ?? "",
      webhookSecret: env.WEBHOOK_SECRET ?? "",
      ttlSeconds: Number(env.TOKEN_TTL_SECONDS || 43_200),
      corsOrigin: env.CORS_ORIGIN ?? "",
      requireSecrets: true,
    };
    return createApp(repo, secrets).fetch(request);
  },
};
