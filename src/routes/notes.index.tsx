import { createFileRoute } from "@tanstack/react-router";
import { CardCluster } from "@/components/card-cluster";
import { Kicker } from "@/components/article";
import { loadBoard } from "@/lib/folio.functions";

export const Route = createFileRoute("/notes/")({
  loader: () => loadBoard(),
  component: NotesIndex,
});

function NotesIndex() {
  const clusters = Route.useLoaderData();
  return (
    <main className="mx-auto max-w-[1120px] px-5 py-10 sm:px-8 sm:py-14">
      <Kicker>Clusters</Kicker>
      <h1 className="mt-3 font-display text-5xl tracking-[-0.035em] text-ink sm:text-6xl">卡片聚类</h1>
      <p className="mt-5 max-w-xl text-[17px] leading-7 text-body">
        分类不再是一排标签。每张聚类卡片收着同类作品与笔记，点开后在同一张台面上散开。
      </p>
      <CardCluster clusters={clusters} />
    </main>
  );
}
