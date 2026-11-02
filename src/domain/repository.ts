import { buildBoard } from "@/domain/classifier";
import { D1_SCHEMA } from "@/domain/schema";
import { seedState } from "@/domain/seed";
import type {
  CallbackRow,
  ClusterRow,
  EntryKind,
  EntryRow,
  EntryStatus,
  PublicCluster,
  PublicEntry,
  Visibility,
} from "@/domain/types";

export type EntryInput = {
  slug: string;
  kind: EntryKind;
  title: string;
  dek: string;
  cover: string;
  coverAlt: string;
  body: EntryRow["body"];
  clusterId: string;
  visibility: Visibility;
  status: EntryStatus;
  readingMinutes: number;
  featured: boolean;
  tags: string[];
  year: string;
  role: string;
  outcome: string;
};

export interface ContentRepository {
  board(): Promise<PublicCluster[]>;
  publicBySlug(slug: string): Promise<PublicEntry | null>;
  adminClusters(): Promise<ClusterRow[]>;
  adminEntries(): Promise<EntryRow[]>;
  callbacks(): Promise<CallbackRow[]>;
  createCluster(input: { slug: string; name: string; blurb: string }): Promise<ClusterRow>;
  updateCluster(
    id: string,
    patch: Partial<Pick<ClusterRow, "slug" | "name" | "blurb" | "sortIndex">>,
  ): Promise<ClusterRow | null>;
  deleteCluster(id: string): Promise<"ok" | "missing" | "not-empty">;
  createEntry(input: EntryInput): Promise<EntryRow>;
  updateEntry(id: string, patch: Partial<EntryInput>): Promise<EntryRow | null>;
  deleteEntry(id: string): Promise<boolean>;
  publish(id: string): Promise<EntryRow | null>;
  addCallback(row: CallbackRow): Promise<void>;
}

function publicView(entry: EntryRow, clusterName: string): PublicEntry {
  return {
    id: entry.id,
    slug: entry.slug,
    kind: entry.kind,
    title: entry.title,
    dek: entry.dek,
    cover: entry.cover,
    coverAlt: entry.coverAlt,
    date: (entry.publishedAt ?? entry.createdAt).slice(0, 10),
    readingMinutes: entry.readingMinutes,
    clusterId: entry.clusterId,
    featured: entry.featured,
    tags: entry.tags,
    year: entry.year,
    role: entry.role,
    outcome: entry.outcome,
    body: entry.body,
    clusterName,
  };
}

type StoreState = {
  clusters: ClusterRow[];
  entries: EntryRow[];
  callbacks: CallbackRow[];
};

export class MemoryRepository implements ContentRepository {
  constructor(private state: StoreState) {}

  snapshot(): StoreState {
    return structuredClone(this.state);
  }

  async board() {
    return buildBoard(this.state.clusters, this.state.entries);
  }

  async publicBySlug(slug: string) {
    const entry = this.state.entries.find(
      (item) => item.slug === slug && item.visibility === "public" && item.status === "published",
    );
    if (!entry) return null;
    const cluster = this.state.clusters.find((item) => item.id === entry.clusterId);
    return publicView(entry, cluster?.name ?? "");
  }

  async adminClusters() {
    return [...this.state.clusters].sort((a, b) => a.sortIndex - b.sortIndex);
  }

  async adminEntries() {
    return [...this.state.entries].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async callbacks() {
    return [...this.state.callbacks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createCluster(input: { slug: string; name: string; blurb: string }) {
    if (this.state.clusters.some((item) => item.slug === input.slug)) {
      throw new Error("slug-taken");
    }
    const row: ClusterRow = {
      id: crypto.randomUUID(),
      slug: input.slug,
      name: input.name,
      blurb: input.blurb,
      sortIndex: this.state.clusters.length,
      createdAt: new Date().toISOString(),
    };
    this.state.clusters.push(row);
    return row;
  }

  async updateCluster(id: string, patch: Partial<Pick<ClusterRow, "slug" | "name" | "blurb" | "sortIndex">>) {
    const row = this.state.clusters.find((item) => item.id === id);
    if (!row) return null;
    if (patch.slug && patch.slug !== row.slug && this.state.clusters.some((item) => item.slug === patch.slug)) {
      throw new Error("slug-taken");
    }
    Object.assign(row, patch);
    return row;
  }

  async deleteCluster(id: string) {
    if (!this.state.clusters.some((item) => item.id === id)) return "missing";
    if (this.state.entries.some((item) => item.clusterId === id)) return "not-empty";
    this.state.clusters = this.state.clusters.filter((item) => item.id !== id);
    return "ok";
  }

  async createEntry(input: EntryInput) {
    if (this.state.entries.some((item) => item.slug === input.slug)) throw new Error("slug-taken");
    if (!this.state.clusters.some((item) => item.id === input.clusterId)) throw new Error("cluster-missing");
    const now = new Date().toISOString();
    const row: EntryRow = {
      ...input,
      id: crypto.randomUUID(),
      publishedAt: input.status === "published" && input.visibility === "public" ? now : null,
      createdAt: now,
      updatedAt: now,
    };
    this.state.entries.push(row);
    return row;
  }

  async updateEntry(id: string, patch: Partial<EntryInput>) {
    const row = this.state.entries.find((item) => item.id === id);
    if (!row) return null;
    if (patch.slug && patch.slug !== row.slug && this.state.entries.some((item) => item.slug === patch.slug)) {
      throw new Error("slug-taken");
    }
    if (patch.clusterId && !this.state.clusters.some((item) => item.id === patch.clusterId)) {
      throw new Error("cluster-missing");
    }
    Object.assign(row, patch, { updatedAt: new Date().toISOString() });
    return row;
  }

  async deleteEntry(id: string) {
    const before = this.state.entries.length;
    this.state.entries = this.state.entries.filter((item) => item.id !== id);
    return this.state.entries.length !== before;
  }

  async publish(id: string) {
    const row = this.state.entries.find((item) => item.id === id);
    if (!row) return null;
    const now = new Date().toISOString();
    row.visibility = "public";
    row.status = "published";
    row.publishedAt = now;
    row.updatedAt = now;
    return row;
  }

  async addCallback(row: CallbackRow) {
    this.state.callbacks.unshift(row);
    this.state.callbacks = this.state.callbacks.slice(0, 50);
  }
}

export function freshMemory(): MemoryRepository {
  const seed = seedState();
  return new MemoryRepository({ clusters: seed.clusters, entries: seed.entries, callbacks: [] });
}

type SqlRow = Record<string, unknown>;

export type SqlDatabase = {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      all<T extends SqlRow>(): Promise<{ results: T[] }>;
      first<T extends SqlRow>(): Promise<T | null>;
      run(): Promise<unknown>;
    };
  };
  exec(sql: string): Promise<unknown>;
};

function asEntry(row: SqlRow): EntryRow {
  return {
    id: String(row.id),
    slug: String(row.slug),
    kind: row.kind === "work" ? "work" : "note",
    title: String(row.title),
    dek: String(row.dek),
    cover: String(row.cover),
    coverAlt: String(row.cover_alt),
    body: JSON.parse(String(row.body_json)) as EntryRow["body"],
    clusterId: String(row.cluster_id),
    visibility: row.visibility === "private" ? "private" : "public",
    status: row.status === "draft" ? "draft" : "published",
    publishedAt: row.published_at ? String(row.published_at) : null,
    readingMinutes: Number(row.reading_minutes),
    featured: Number(row.featured) === 1,
    tags: JSON.parse(String(row.tags_json)) as string[],
    year: String(row.year ?? ""),
    role: String(row.role ?? ""),
    outcome: String(row.outcome ?? ""),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function asCluster(row: SqlRow): ClusterRow {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    blurb: String(row.blurb),
    sortIndex: Number(row.sort_index),
    createdAt: String(row.created_at),
  };
}

export class D1Repository implements ContentRepository {
  constructor(private db: SqlDatabase) {}

  async migrate() {
    await this.db.exec(D1_SCHEMA);
    const count = await this.db.prepare("SELECT COUNT(*) AS n FROM clusters").bind().first<{ n: number }>();
    if (Number(count?.n ?? 0) > 0) return;
    const seed = seedState();
    for (const cluster of seed.clusters) {
      await this.db
        .prepare(
          `INSERT INTO clusters (id, slug, name, blurb, sort_index, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .bind(cluster.id, cluster.slug, cluster.name, cluster.blurb, cluster.sortIndex, cluster.createdAt)
        .run();
    }
    for (const entry of seed.entries) await this.insertEntry(entry);
  }

  private async insertEntry(entry: EntryRow) {
    await this.db
      .prepare(
        `INSERT INTO entries (
          id, slug, kind, title, dek, cover, cover_alt, body_json, cluster_id, visibility, status,
          published_at, reading_minutes, featured, tags_json, year, role, outcome, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        entry.id,
        entry.slug,
        entry.kind,
        entry.title,
        entry.dek,
        entry.cover,
        entry.coverAlt,
        JSON.stringify(entry.body),
        entry.clusterId,
        entry.visibility,
        entry.status,
        entry.publishedAt,
        entry.readingMinutes,
        entry.featured ? 1 : 0,
        JSON.stringify(entry.tags),
        entry.year,
        entry.role,
        entry.outcome,
        entry.createdAt,
        entry.updatedAt,
      )
      .run();
  }

  private async allEntries(): Promise<EntryRow[]> {
    const rows = await this.db.prepare("SELECT * FROM entries").bind().all<SqlRow>();
    return rows.results.map(asEntry);
  }

  private async allClusters(): Promise<ClusterRow[]> {
    const rows = await this.db.prepare("SELECT * FROM clusters ORDER BY sort_index").bind().all<SqlRow>();
    return rows.results.map(asCluster);
  }

  async board() {
    return buildBoard(await this.allClusters(), await this.allEntries());
  }

  async publicBySlug(slug: string) {
    const row = await this.db
      .prepare(
        `SELECT * FROM entries WHERE slug = ? AND visibility = 'public' AND status = 'published'`,
      )
      .bind(slug)
      .first<SqlRow>();
    if (!row) return null;
    const entry = asEntry(row);
    const cluster = await this.db.prepare("SELECT name FROM clusters WHERE id = ?").bind(entry.clusterId).first<{ name: string }>();
    return publicView(entry, cluster?.name ?? "");
  }

  async adminClusters() {
    return this.allClusters();
  }

  async adminEntries() {
    const rows = await this.db.prepare("SELECT * FROM entries ORDER BY updated_at DESC").bind().all<SqlRow>();
    return rows.results.map(asEntry);
  }

  async callbacks() {
    const rows = await this.db
      .prepare("SELECT * FROM callbacks ORDER BY created_at DESC LIMIT 50")
      .bind()
      .all<SqlRow>();
    return rows.results.map((row) => ({
      id: String(row.id),
      entryId: String(row.entry_id),
      eventType: String(row.event_type),
      targetUrl: String(row.target_url),
      statusCode: row.status_code == null ? null : Number(row.status_code),
      ok: Number(row.ok) === 1,
      detail: String(row.detail ?? ""),
      createdAt: String(row.created_at),
    }));
  }

  async createCluster(input: { slug: string; name: string; blurb: string }) {
    const existing = await this.db.prepare("SELECT id FROM clusters WHERE slug = ?").bind(input.slug).first();
    if (existing) throw new Error("slug-taken");
    const count = await this.db.prepare("SELECT COUNT(*) AS n FROM clusters").bind().first<{ n: number }>();
    const row: ClusterRow = {
      id: crypto.randomUUID(),
      slug: input.slug,
      name: input.name,
      blurb: input.blurb,
      sortIndex: Number(count?.n ?? 0),
      createdAt: new Date().toISOString(),
    };
    await this.db
      .prepare(`INSERT INTO clusters (id, slug, name, blurb, sort_index, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(row.id, row.slug, row.name, row.blurb, row.sortIndex, row.createdAt)
      .run();
    return row;
  }

  async updateCluster(id: string, patch: Partial<Pick<ClusterRow, "slug" | "name" | "blurb" | "sortIndex">>) {
    const current = await this.db.prepare("SELECT * FROM clusters WHERE id = ?").bind(id).first<SqlRow>();
    if (!current) return null;
    const row = asCluster(current);
    if (patch.slug && patch.slug !== row.slug) {
      const taken = await this.db.prepare("SELECT id FROM clusters WHERE slug = ?").bind(patch.slug).first();
      if (taken) throw new Error("slug-taken");
    }
    const next = { ...row, ...patch };
    await this.db
      .prepare(`UPDATE clusters SET slug = ?, name = ?, blurb = ?, sort_index = ? WHERE id = ?`)
      .bind(next.slug, next.name, next.blurb, next.sortIndex, id)
      .run();
    return next;
  }

  async deleteCluster(id: string) {
    const current = await this.db.prepare("SELECT id FROM clusters WHERE id = ?").bind(id).first();
    if (!current) return "missing";
    const used = await this.db.prepare("SELECT id FROM entries WHERE cluster_id = ?").bind(id).first();
    if (used) return "not-empty";
    await this.db.prepare("DELETE FROM clusters WHERE id = ?").bind(id).run();
    return "ok";
  }

  async createEntry(input: EntryInput) {
    const taken = await this.db.prepare("SELECT id FROM entries WHERE slug = ?").bind(input.slug).first();
    if (taken) throw new Error("slug-taken");
    const cluster = await this.db.prepare("SELECT id FROM clusters WHERE id = ?").bind(input.clusterId).first();
    if (!cluster) throw new Error("cluster-missing");
    const now = new Date().toISOString();
    const row: EntryRow = {
      ...input,
      id: crypto.randomUUID(),
      publishedAt: input.status === "published" && input.visibility === "public" ? now : null,
      createdAt: now,
      updatedAt: now,
    };
    await this.insertEntry(row);
    return row;
  }

  async updateEntry(id: string, patch: Partial<EntryInput>) {
    const current = await this.db.prepare("SELECT * FROM entries WHERE id = ?").bind(id).first<SqlRow>();
    if (!current) return null;
    const row = asEntry(current);
    if (patch.slug && patch.slug !== row.slug) {
      const taken = await this.db.prepare("SELECT id FROM entries WHERE slug = ?").bind(patch.slug).first();
      if (taken) throw new Error("slug-taken");
    }
    if (patch.clusterId) {
      const cluster = await this.db.prepare("SELECT id FROM clusters WHERE id = ?").bind(patch.clusterId).first();
      if (!cluster) throw new Error("cluster-missing");
    }
    const next: EntryRow = { ...row, ...patch, updatedAt: new Date().toISOString() };
    await this.db
      .prepare(
        `UPDATE entries SET slug = ?, kind = ?, title = ?, dek = ?, cover = ?, cover_alt = ?, body_json = ?,
         cluster_id = ?, visibility = ?, status = ?, published_at = ?, reading_minutes = ?, featured = ?,
         tags_json = ?, year = ?, role = ?, outcome = ?, updated_at = ? WHERE id = ?`,
      )
      .bind(
        next.slug,
        next.kind,
        next.title,
        next.dek,
        next.cover,
        next.coverAlt,
        JSON.stringify(next.body),
        next.clusterId,
        next.visibility,
        next.status,
        next.publishedAt,
        next.readingMinutes,
        next.featured ? 1 : 0,
        JSON.stringify(next.tags),
        next.year,
        next.role,
        next.outcome,
        next.updatedAt,
        id,
      )
      .run();
    return next;
  }

  async deleteEntry(id: string) {
    const current = await this.db.prepare("SELECT id FROM entries WHERE id = ?").bind(id).first();
    if (!current) return false;
    await this.db.prepare("DELETE FROM entries WHERE id = ?").bind(id).run();
    return true;
  }

  async publish(id: string) {
    const current = await this.db.prepare("SELECT * FROM entries WHERE id = ?").bind(id).first<SqlRow>();
    if (!current) return null;
    const now = new Date().toISOString();
    await this.db
      .prepare(
        `UPDATE entries SET visibility = 'public', status = 'published', published_at = ?, updated_at = ? WHERE id = ?`,
      )
      .bind(now, now, id)
      .run();
    return asEntry({ ...current, visibility: "public", status: "published", published_at: now, updated_at: now });
  }

  async addCallback(row: CallbackRow) {
    await this.db
      .prepare(
        `INSERT INTO callbacks (id, entry_id, event_type, target_url, status_code, ok, detail, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        row.id,
        row.entryId,
        row.eventType,
        row.targetUrl,
        row.statusCode,
        row.ok ? 1 : 0,
        row.detail,
        row.createdAt,
      )
      .run();
  }
}
