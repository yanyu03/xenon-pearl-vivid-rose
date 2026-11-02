import { createFileRoute, Link } from "@tanstack/react-router";
import { Kicker } from "@/components/article";
import { loadBoard } from "@/lib/folio.functions";

export const Route = createFileRoute("/work/")({
  loader: () => loadBoard(),
  component: WorkIndex,
});

function WorkIndex() {
  const works = Route.useLoaderData()
    .flatMap((cluster) => cluster.cards)
    .filter((card) => card.kind === "work");
  return (
    <main className="mx-auto max-w-[1120px] px-5 py-14 sm:px-8 sm:py-20">
      <Kicker>Portfolio</Kicker>
      <h1 className="mt-3 font-display text-5xl tracking-[-0.035em] text-ink sm:text-6xl">作品集</h1>
      <p className="mt-5 max-w-xl text-[17px] leading-7 text-body">
        展览、器物、档案。每件作品写清角色、约束和结果，不写「赋能」。
      </p>
      <div className="mt-14 space-y-16">
        {works.map((work, index) => (
          <Link
            key={work.slug}
            to="/work/$slug"
            params={{ slug: work.slug }}
            className="group grid items-center gap-8 md:grid-cols-2 md:gap-12"
          >
            <div className={index % 2 === 1 ? "md:order-2" : undefined}>
              <div className="overflow-hidden rounded-lg bg-surface-card">
                <img
                  src={work.cover}
                  alt={work.coverAlt}
                  className="aspect-[3/2] w-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                />
              </div>
            </div>
            <div>
              <p className="font-mono text-xs tracking-[0.12em] text-muted">
                {work.year} · {work.tags.join(" / ")}
              </p>
              <h2 className="mt-3 font-display text-3xl tracking-[-0.03em] text-ink sm:text-4xl">
                {work.title}
              </h2>
              <p className="mt-3 text-[16px] leading-7 text-body">{work.dek}</p>
              <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted">角色</dt>
                  <dd className="mt-1 text-ink">{work.role}</dd>
                </div>
                <div>
                  <dt className="text-muted">结果</dt>
                  <dd className="mt-1 text-ink">{work.outcome}</dd>
                </div>
              </dl>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
