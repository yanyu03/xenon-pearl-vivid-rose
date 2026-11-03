import { createConnection, type Connection } from "mysql2/promise";
import { D1Repository, type SqlDatabase } from "./repository";
import { createApp } from "./http";
import type { Secrets } from "./types";

/**
 * Pages Functions -> Hyperdrive -> TiDB Cloud.
 * No D1 migration or demo seeding on requests. Requires pre-created folio_* tables.
 * The adapter preserves the existing repository interface while translating table names.
 */
export type PagesEnv = {
  HYPERDRIVE?: {
    host: string; user: string; password: string; database: string; port: number;
  };
  ADMIN_PASSWORD?: string;
  SESSION_SECRET?: string;
  WEBHOOK_URL?: string;
  WEBHOOK_SECRET?: string;
  TOKEN_TTL_SECONDS?: string;
  CORS_ORIGIN?: string;
};

const TABLES: Record<string, string> = {
  clusters: "folio_clusters",
  entries: "folio_entries",
  callbacks: "folio_callbacks",
};
function translate(sql: string): string {
  return sql.replace(/\b(clusters|entries|callbacks)\b/g, (name) => TABLES[name] ?? name);
}
function normalize(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/.test(value))
    return value.replace("T", " ").replace(/Z$/, "").replace(/\.\d{3}$/, "");
  return value;
}
function adaptRow(row: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [
    key,
    value instanceof Date ? value.toISOString() : value,
  ]));
}
function database(connection: Connection): SqlDatabase {
  return {
    prepare(sql: string) {
      const statement = translate(sql);
      return {
        bind(...params: unknown[]) {
          const values = params.map(normalize);
          return {
            async all<T extends Record<string, unknown>>() {
              const [rows] = await connection.execute(statement, values);
              return { results: (rows as Record<string, unknown>[]).map(adaptRow) as T[] };
            },
            async first<T extends Record<string, unknown>>() {
              const [rows] = await connection.execute(statement, values);
              return ((rows as Record<string, unknown>[])[0]
                ? adaptRow((rows as Record<string, unknown>[])[0]) : null) as T | null;
            },
            async run() {
              const [result] = await connection.execute(statement, values);
              return result;
            },
          };
        },
      };
    },
    async exec() {
      throw new Error("Schema migrations must be run explicitly, never from Pages Functions");
    },
  };
}

export async function handlePagesApi(request: Request, env: PagesEnv): Promise<Response> {
  if (!env.HYPERDRIVE) {
    return Response.json({ error: "Hyperdrive binding missing" }, { status: 503 });
  }
  const connection = await createConnection({
    host: env.HYPERDRIVE.host,
    user: env.HYPERDRIVE.user,
    password: env.HYPERDRIVE.password,
    database: env.HYPERDRIVE.database,
    port: env.HYPERDRIVE.port,
    disableEval: true,
    // Keep JSON as text for the existing D1Repository deserializer.
    jsonStrings: true,
    timezone: "Z",
    dateStrings: false,
  });
  try {
    const repo = new D1Repository(database(connection));
    const secrets: Secrets = {
      adminPassword: env.ADMIN_PASSWORD ?? "",
      sessionSecret: env.SESSION_SECRET ?? "",
      webhookUrl: env.WEBHOOK_URL ?? "",
      webhookSecret: env.WEBHOOK_SECRET ?? "",
      ttlSeconds: Number(env.TOKEN_TTL_SECONDS || 43_200),
      corsOrigin: env.CORS_ORIGIN ?? "",
      requireSecrets: true,
    };
    return await createApp(repo, secrets).fetch(request);
  } finally {
    await connection.end();
  }
}
