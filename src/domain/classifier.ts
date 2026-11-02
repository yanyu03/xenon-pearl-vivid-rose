import type { EntryRow, PublicCard, PublicCluster, ClusterRow } from "@/domain/types";

function isPublic(entry: EntryRow): boolean {
  return entry.visibility === "public" && entry.status === "published";
}

/** Normalized table coordinates (percent), left to right on a shallow arc. */
export function layoutCards(count: number): Array<{ x: number; y: number }> {
  if (count <= 0) return [];
  if (count === 1) return [{ x: 50, y: 50 }];
  return Array.from({ length: count }, (_, index) => {
    const t = index / (count - 1);
    const delta = index - (count - 1) / 2;
    return {
      x: Math.round(18 + t * 64),
      y: Math.round(46 + Math.abs(delta) * 8),
    };
  });
}

export function buildBoard(clusters: ClusterRow[], entries: EntryRow[]): PublicCluster[] {
  const ordered = [...clusters].sort((a, b) => a.sortIndex - b.sortIndex || a.name.localeCompare(b.name));
  return ordered.map((cluster) => {
    const members = entries
      .filter((entry) => entry.clusterId === cluster.id && isPublic(entry))
      .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
    const spots = layoutCards(members.length);
    const cards: PublicCard[] = members.map((entry, index) => ({
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
      x: spots[index]?.x ?? 50,
      y: spots[index]?.y ?? 50,
    }));
    return {
      id: cluster.id,
      slug: cluster.slug,
      name: cluster.name,
      blurb: cluster.blurb,
      sortIndex: cluster.sortIndex,
      cards,
    };
  });
}
