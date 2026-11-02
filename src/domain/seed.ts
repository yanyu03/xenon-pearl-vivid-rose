import { notes, works, type Block } from "@/lib/content";
import type { ClusterRow, EntryRow } from "@/domain/types";

const CLUSTERS: ClusterRow[] = [
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-000000000001",
    slug: "ai",
    name: "AI 实验",
    blurb: "把模型放进工作流里，而不是放进口号里。",
    sortIndex: 0,
    createdAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-000000000002",
    slug: "engineering",
    name: "工程",
    blurb: "推倒重来、接口和发布权。",
    sortIndex: 1,
    createdAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-000000000003",
    slug: "essay",
    name: "随笔",
    blurb: "失败也留下，不写成教程。",
    sortIndex: 2,
    createdAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-000000000004",
    slug: "work",
    name: "作品",
    blurb: "展览、档案、器物。已经交到别人手里的东西。",
    sortIndex: 3,
    createdAt: "2026-06-01T00:00:00.000Z",
  },
];

const NOTE_CLUSTER: Record<string, string> = {
  "prompts-are-specs": CLUSTERS[0]!.id,
  "agent-week": CLUSTERS[0]!.id,
  "multi-model-failure": CLUSTERS[2]!.id,
  "third-rebuild": CLUSTERS[1]!.id,
};

const IDS = [
  "11111111-1111-4111-8111-000000000001",
  "11111111-1111-4111-8111-000000000002",
  "11111111-1111-4111-8111-000000000003",
  "11111111-1111-4111-8111-000000000004",
  "11111111-1111-4111-8111-000000000005",
  "11111111-1111-4111-8111-000000000006",
  "11111111-1111-4111-8111-000000000007",
  "11111111-1111-4111-8111-000000000008",
];

function stamp(date: string): string {
  return `${date}T08:00:00.000Z`;
}

export function seedState(): { clusters: ClusterRow[]; entries: EntryRow[] } {
  const noteEntries: EntryRow[] = notes.map((note, index) => ({
    id: IDS[index]!,
    slug: note.slug,
    kind: "note",
    title: note.title,
    dek: note.dek,
    cover: note.cover,
    coverAlt: note.coverAlt,
    body: note.body,
    clusterId: NOTE_CLUSTER[note.slug] ?? CLUSTERS[2]!.id,
    visibility: "public",
    status: "published",
    publishedAt: stamp(note.date),
    readingMinutes: note.readingMinutes,
    featured: Boolean(note.featured),
    tags: [...note.tags],
    year: note.date.slice(0, 4),
    role: "",
    outcome: "",
    createdAt: stamp(note.date),
    updatedAt: stamp(note.date),
  }));

  const workEntries: EntryRow[] = works.map((work, index) => ({
    id: IDS[index + notes.length]!,
    slug: work.slug,
    kind: "work",
    title: work.title,
    dek: work.dek,
    cover: work.cover,
    coverAlt: work.coverAlt,
    body: work.body,
    clusterId: CLUSTERS[3]!.id,
    visibility: "public",
    status: "published",
    publishedAt: `${work.year}-06-01T08:00:00.000Z`,
    readingMinutes: 6,
    featured: false,
    tags: [...work.tags],
    year: work.year,
    role: work.role,
    outcome: work.outcome,
    createdAt: `${work.year}-06-01T08:00:00.000Z`,
    updatedAt: `${work.year}-06-01T08:00:00.000Z`,
  }));

  const draftBody: Block[] = [
    { type: "p", text: "还没写完。先记下约束：不要 App，不要第二档色温。" },
  ];

  const draft: EntryRow = {
    id: IDS[7]!,
    slug: "lamp-followup",
    kind: "note",
    title: "夜读灯的下一版，先不公开",
    dek: "草稿。只在后台可见。",
    cover: "/images/work-lamp.jpg",
    coverAlt: "夜读灯",
    body: draftBody,
    clusterId: CLUSTERS[1]!.id,
    visibility: "private",
    status: "draft",
    publishedAt: null,
    readingMinutes: 3,
    featured: false,
    tags: ["工程"],
    year: "2026",
    role: "",
    outcome: "",
    createdAt: "2026-09-20T08:00:00.000Z",
    updatedAt: "2026-09-20T08:00:00.000Z",
  };

  return { clusters: CLUSTERS, entries: [...noteEntries, ...workEntries, draft] };
}
