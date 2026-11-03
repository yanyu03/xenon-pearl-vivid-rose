import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createApp } from "@/domain/http";
import { freshMemory, MemoryRepository } from "@/domain/repository";
import type { Secrets } from "@/domain/types";

const FILE = "/workspace/.data/folio.json";

type GlobalStore = typeof globalThis & { __folioRepo?: MemoryRepository };

function loadRepo(): MemoryRepository {
  const g = globalThis as GlobalStore;
  if (g.__folioRepo) return g.__folioRepo;
  try {
    const raw = readFileSync(FILE, "utf8");
    const parsed = JSON.parse(raw) as {
      clusters?: MemoryRepository extends never ? never : import("@/domain/types").ClusterRow[];
      entries?: import("@/domain/types").EntryRow[];
      callbacks?: import("@/domain/types").CallbackRow[];
    };
    if (parsed.clusters?.length && parsed.entries?.length) {
      g.__folioRepo = new MemoryRepository({
        clusters: parsed.clusters,
        entries: parsed.entries,
        callbacks: parsed.callbacks ?? [],
      });
      return g.__folioRepo;
    }
  } catch {
    // first boot, or a host without a writable disk
  }
  g.__folioRepo = freshMemory();
  persist(g.__folioRepo);
  return g.__folioRepo;
}

let lastSnapshot = "";

function persist(repo: MemoryRepository) {
  try {
    const next = JSON.stringify(repo.snapshot());
    if (next === lastSnapshot) return;
    try {
      if (readFileSync(FILE, "utf8") === next) {
        lastSnapshot = next;
        return;
      }
    } catch {
      // file not created yet
    }
    lastSnapshot = next;
    mkdirSync("/workspace/.data", { recursive: true });
    writeFileSync(FILE, next);
  } catch {
    // Vercel and other read-only hosts keep the in-memory copy only.
  }
}

export function previewSecrets(): Secrets {
  return {
    adminPassword: process.env.ADMIN_PASSWORD || "",
    sessionSecret: process.env.SESSION_SECRET || "",
    webhookUrl: process.env.WEBHOOK_URL || "",
    webhookSecret: process.env.WEBHOOK_SECRET || "",
    ttlSeconds: Number(process.env.TOKEN_TTL_SECONDS || 43_200),
    corsOrigin: process.env.CORS_ORIGIN || "",
    requireSecrets: true,
  };
}

export function getRepo(): MemoryRepository {
  return loadRepo();
}

export async function handleApi(request: Request): Promise<Response> {
  const repo = loadRepo();
  const app = createApp(repo, previewSecrets());
  const response = await app.fetch(request);
  persist(repo);
  return response;
}
