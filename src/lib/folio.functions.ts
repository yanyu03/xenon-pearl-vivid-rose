import { createServerFn } from "@tanstack/react-start";
import type { PublicCluster, PublicEntry } from "@/domain/types";

/** Always read published content through the Pages API (no memory/demo fallback). */
async function publicApi<T>(path: string): Promise<T | null> {
  const { getRequestUrl } = await import("@tanstack/react-start/server");
  const requestUrl = getRequestUrl();
  const url = new URL(path, requestUrl);
  const response = await fetch(url.toString(), {
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Folio API unavailable (HTTP ${response.status})`);
  const payload = (await response.json()) as { data: T };
  return payload.data;
}

export const loadBoard = createServerFn({ method: "GET" }).handler(async () => {
  const board = await publicApi<PublicCluster[]>("/api/v1/clusters");
  if (!board) throw new Error("Folio board unavailable");
  return board;
});

export const loadArticle = createServerFn({ method: "GET" })
  .validator((slug: string) => {
    if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new Error("无效的文章 slug");
    }
    return slug;
  })
  .handler(async ({ data }) => {
    const entry = await publicApi<PublicEntry>(`/api/v1/entries/${encodeURIComponent(data)}`);
    if (!entry) return null;
    const board = await publicApi<PublicCluster[]>("/api/v1/clusters");
    if (!board) throw new Error("Folio board unavailable");
    const related = (board.find((cluster) => cluster.id === entry.clusterId)?.cards ?? [])
      .filter((card) => card.slug !== entry.slug)
      .slice(0, 2);
    return { entry, related };
  });
