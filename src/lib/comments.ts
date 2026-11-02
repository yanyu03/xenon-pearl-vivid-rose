export type Comment = {
  id: string;
  slug: string;
  parentId: string | null;
  author: string;
  body: string;
  createdAt: number;
  likes: number;
};

export type ReactionKey = "plus" | "heart" | "eyes";

export type ReactionState = Record<ReactionKey, { count: number; mine: boolean }>;

const SEED: Comment[] = [
  {
    id: "c1",
    slug: "prompts-are-specs",
    parentId: null,
    author: "陈麦",
    body: "「咒语无法 code review」这句我会贴到团队频道。我们现在的系统提示里至少有四成形容词。",
    createdAt: Date.parse("2026-09-13T10:12:00+08:00"),
    likes: 6,
  },
  {
    id: "c2",
    slug: "prompts-are-specs",
    parentId: "c1",
    author: "林予",
    body: "可以从删掉「请逐步思考」开始。如果推理质量掉了，再用可测试的思维链补回去。",
    createdAt: Date.parse("2026-09-13T11:04:00+08:00"),
    likes: 3,
  },
  {
    id: "c3",
    slug: "prompts-are-specs",
    parentId: null,
    author: "Nia",
    body: "黄金样例这一段值得单独成文。你们的 12 个样例是按失败模式分的，还是按任务分的？",
    createdAt: Date.parse("2026-09-14T08:40:00+08:00"),
    likes: 2,
  },
  {
    id: "c4",
    slug: "agent-week",
    parentId: null,
    author: "周屿",
    body: "把发布权收回是关键。我吃过 Agent 直接 push 到 main 的亏。",
    createdAt: Date.parse("2026-08-22T19:20:00+08:00"),
    likes: 4,
  },
  {
    id: "c5",
    slug: "city-soundscape",
    parentId: null,
    author: "何岚",
    body: "在展厅走完一遍江岸，耳机里的风比窗外的江风还真。去掉播放按钮是对的。",
    createdAt: Date.parse("2025-10-02T16:08:00+08:00"),
    likes: 8,
  },
  {
    id: "c6",
    slug: "family-archive",
    parentId: null,
    author: "阿树",
    body: "「位置本身就是索引」——我家的箱底也可以这样。谢谢这个提醒。",
    createdAt: Date.parse("2025-05-01T09:14:00+08:00"),
    likes: 5,
  },
  {
    id: "c7",
    slug: "night-lamp",
    parentId: null,
    author: "木子",
    body: "只有一档开关。当代产品里最奢侈的功能。",
    createdAt: Date.parse("2024-12-20T21:33:00+08:00"),
    likes: 7,
  },
  {
    id: "c8",
    slug: "multi-model-failure",
    parentId: null,
    author: "Pei",
    body: "三个模型传话筒这段写得狠。我下线了「综合者」。",
    createdAt: Date.parse("2026-07-04T13:50:00+08:00"),
    likes: 3,
  },
  {
    id: "c9",
    slug: "third-rebuild",
    parentId: null,
    author: "南风",
    body: "奶油色就是产品。同意。暗色模式常常是在为不存在的用户工作。",
    createdAt: Date.parse("2026-06-19T18:02:00+08:00"),
    likes: 4,
  },
];

const COMMENT_KEY = "folio.comments.v1";
const LIKE_KEY = "folio.comment-likes.v1";
const REACTION_KEY = "folio.reactions.v1";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function seedComments(slug: string): Comment[] {
  return SEED.filter((c) => c.slug === slug).sort((a, b) => a.createdAt - b.createdAt);
}

export function loadComments(slug: string): Comment[] {
  const extras = readJson<Comment[]>(COMMENT_KEY, []);
  const merged = [...SEED, ...extras.filter((c) => !SEED.some((s) => s.id === c.id))];
  return merged
    .filter((c) => c.slug === slug)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function saveComment(input: {
  slug: string;
  parentId: string | null;
  author: string;
  body: string;
}): Comment {
  const comment: Comment = {
    id: `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    slug: input.slug,
    parentId: input.parentId,
    author: input.author.trim() || "访客",
    body: input.body.trim(),
    createdAt: Date.now(),
    likes: 0,
  };
  const extras = readJson<Comment[]>(COMMENT_KEY, []);
  writeJson(COMMENT_KEY, [...extras, comment]);
  return comment;
}

export function loadLikedIds(): string[] {
  return readJson<string[]>(LIKE_KEY, []);
}

export function toggleCommentLike(id: string): string[] {
  const current = new Set(loadLikedIds());
  if (current.has(id)) current.delete(id);
  else current.add(id);
  const next = [...current];
  writeJson(LIKE_KEY, next);
  return next;
}

const DEFAULT_REACTIONS: ReactionState = {
  plus: { count: 0, mine: false },
  heart: { count: 0, mine: false },
  eyes: { count: 0, mine: false },
};

const SEED_REACTIONS: Record<string, Record<ReactionKey, number>> = {
  "prompts-are-specs": { plus: 18, heart: 11, eyes: 7 },
  "agent-week": { plus: 9, heart: 4, eyes: 6 },
  "multi-model-failure": { plus: 12, heart: 8, eyes: 5 },
  "third-rebuild": { plus: 7, heart: 9, eyes: 3 },
  "city-soundscape": { plus: 22, heart: 16, eyes: 9 },
  "family-archive": { plus: 14, heart: 19, eyes: 4 },
  "night-lamp": { plus: 20, heart: 13, eyes: 2 },
};

export function seedReactions(slug: string): ReactionState {
  const seed = SEED_REACTIONS[slug] ?? { plus: 2, heart: 1, eyes: 1 };
  return {
    plus: { count: seed.plus, mine: false },
    heart: { count: seed.heart, mine: false },
    eyes: { count: seed.eyes, mine: false },
  };
}

export function loadReactions(slug: string): ReactionState {
  const mine = readJson<Record<string, ReactionKey[]>>(REACTION_KEY, {});
  const mineKeys = new Set(mine[slug] ?? []);
  const seed = SEED_REACTIONS[slug] ?? { plus: 2, heart: 1, eyes: 1 };
  const keys: ReactionKey[] = ["plus", "heart", "eyes"];
  const next = { ...DEFAULT_REACTIONS };
  for (const key of keys) {
    const extra = mineKeys.has(key) ? 1 : 0;
    next[key] = { count: seed[key] + extra, mine: mineKeys.has(key) };
  }
  return next;
}

export function toggleReaction(slug: string, key: ReactionKey): ReactionState {
  const mine = readJson<Record<string, ReactionKey[]>>(REACTION_KEY, {});
  const current = new Set(mine[slug] ?? []);
  if (current.has(key)) current.delete(key);
  else current.add(key);
  mine[slug] = [...current];
  writeJson(REACTION_KEY, mine);
  return loadReactions(slug);
}

export function relativeTime(ts: number) {
  const delta = Date.now() - ts;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (delta < hour) {
    const m = Math.max(1, Math.round(delta / minute));
    return `${m} 分钟前`;
  }
  if (delta < day) {
    const h = Math.round(delta / hour);
    return `${h} 小时前`;
  }
  if (delta < 14 * day) {
    const d = Math.round(delta / day);
    return `${d} 天前`;
  }
  const date = new Date(ts);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}
