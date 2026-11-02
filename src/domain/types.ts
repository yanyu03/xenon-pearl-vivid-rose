import type { Block } from "@/lib/content";

export type Visibility = "public" | "private";
export type EntryStatus = "draft" | "published";
export type EntryKind = "note" | "work";

export type ClusterRow = {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  sortIndex: number;
  createdAt: string;
};

export type EntryRow = {
  id: string;
  slug: string;
  kind: EntryKind;
  title: string;
  dek: string;
  cover: string;
  coverAlt: string;
  body: Block[];
  clusterId: string;
  visibility: Visibility;
  status: EntryStatus;
  publishedAt: string | null;
  readingMinutes: number;
  featured: boolean;
  tags: string[];
  year: string;
  role: string;
  outcome: string;
  createdAt: string;
  updatedAt: string;
};

export type CallbackRow = {
  id: string;
  entryId: string;
  eventType: string;
  targetUrl: string;
  statusCode: number | null;
  ok: boolean;
  detail: string;
  createdAt: string;
};

export type PublicCard = {
  id: string;
  slug: string;
  kind: EntryKind;
  title: string;
  dek: string;
  cover: string;
  coverAlt: string;
  date: string;
  readingMinutes: number;
  clusterId: string;
  featured: boolean;
  tags: string[];
  year: string;
  role: string;
  outcome: string;
  x: number;
  y: number;
};

export type PublicCluster = {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  sortIndex: number;
  cards: PublicCard[];
};

export type PublicEntry = Omit<PublicCard, "x" | "y"> & {
  body: Block[];
  clusterName: string;
};

export type Secrets = {
  adminPassword: string;
  sessionSecret: string;
  webhookUrl: string;
  webhookSecret: string;
  ttlSeconds: number;
  corsOrigin: string;
  requireSecrets: boolean;
};

export type SessionClaims = {
  sub: "admin";
  iat: number;
  exp: number;
  jti: string;
};
