import { createServerFn } from "@tanstack/react-start";

export const loadBoard = createServerFn({ method: "GET" }).handler(async () => {
  const { getRepo } = await import("@/domain/node-handler.server");
  return getRepo().board();
});

export const loadArticle = createServerFn({ method: "GET" })
  .validator((slug: string) => {
    if (typeof slug !== "string" || !slug) throw new Error("缺少 slug");
    return slug;
  })
  .handler(async ({ data }) => {
    const { getRepo } = await import("@/domain/node-handler.server");
    const repo = getRepo();
    const entry = await repo.publicBySlug(data);
    if (!entry) return null;
    const board = await repo.board();
    const related = (board.find((cluster) => cluster.id === entry.clusterId)?.cards ?? [])
      .filter((card) => card.slug !== entry.slug)
      .slice(0, 2);
    return { entry, related };
  });
