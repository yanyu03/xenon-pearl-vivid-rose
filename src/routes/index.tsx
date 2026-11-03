import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { CardCluster } from "@/components/card-cluster";
import { Kicker } from "@/components/article";
import { loadBoard } from "@/lib/folio.functions";
import { site } from "@/lib/site";

export const Route = createFileRoute("/")({
  loader: () => loadBoard(),
  component: Home,
});

function Home() {
  const clusters = Route.useLoaderData();
  const cards = clusters.flatMap((cluster) => cluster.cards);
  const featured = cards.find((card) => card.featured && card.kind === "note") ?? cards.find((card) => card.kind === "note");
  const works = cards.filter((card) => card.kind === "work");

  return (
    <main>
      <section className="relative mx-auto max-w-[1200px] overflow-hidden px-5 pt-20 pb-16 sm:px-8 sm:pt-28 sm:pb-20">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-semibold tracking-[0.12em] text-primary"><span className="size-2 rounded-full bg-primary" /> INDEPENDENT DIGITAL JOURNAL</div>
        <h1 className="mt-4 max-w-4xl font-display text-[2.8rem] font-semibold leading-[1.12] tracking-[-0.055em] text-ink sm:text-6xl md:text-[5rem]">
          把做出来的东西，认真写下来。
        </h1>
        <p className="mt-7 max-w-2xl text-[17px] leading-8 text-body sm:text-xl">
          {site.author.name}的{site.tagline}。不做功能清单，只留下经得起回看的作品、实验和上线记录。
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/work"
            className="inline-flex h-11 items-center rounded-full bg-primary px-7 text-sm font-medium text-on-primary transition-colors duration-150 hover:bg-primary-active"
          >
            看作品
          </Link>
          <Link
            to="/notes"
            className="inline-flex h-11 items-center rounded-full px-7 text-sm font-medium text-ink shadow-[0_0_0_1px_var(--color-hairline)] transition-[box-shadow] duration-150 hover:shadow-[0_0_0_1px_var(--color-muted-soft)]"
          >
            读笔记
          </Link>
        </div>
      </section>

      {featured ? (
      <section className="mx-auto max-w-[1200px] px-5 pb-20 sm:px-8">
        <Link
          to="/notes/$slug"
          params={{ slug: featured.slug }}
          className="editorial-card group block overflow-hidden"
        >
          <div className="flex flex-col justify-center px-7 py-10 sm:px-12">
            <Kicker>精选文章</Kicker>
            <h2 className="mt-3 font-display text-3xl leading-tight tracking-[-0.03em] text-ink sm:text-4xl">
              {featured.title}
            </h2>
            <p className="mt-4 text-[16px] leading-7 text-body">{featured.dek}</p>
            <p className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
              阅读全文
              <ArrowUpRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </p>
          </div>
        </Link>
      </section>
      ) : null}

      <section className="bg-surface-soft">
        <div className="mx-auto max-w-[1120px] px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <Kicker>Portfolio</Kicker>
              <h2 className="mt-2 font-display text-3xl tracking-[-0.03em] text-ink sm:text-4xl">
                作品
              </h2>
            </div>
            <Link to="/work" className="text-sm font-medium text-primary hover:text-primary-active">
              全部作品
            </Link>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {works.map((work) => (
              <Link key={work.slug} to="/work/$slug" params={{ slug: work.slug }} className="group">
                <p className="mt-5 px-2 text-xs font-medium tracking-[0.12em] text-muted">
                  {work.year} · {work.role}
                </p>
                <h3 className="mt-2 px-2 font-display text-2xl font-semibold tracking-[-0.04em] text-ink">
                  {work.title}
                </h3>
                <p className="mt-2 px-2 pb-4 text-sm leading-6 text-body">{work.dek}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1120px] px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <Kicker>Clusters</Kicker>
            <h2 className="mt-2 font-display text-3xl tracking-[-0.03em] text-ink sm:text-4xl">
              卡片聚类
            </h2>
          </div>
          <Link to="/notes" className="text-sm font-medium text-primary hover:text-primary-active">
            全部展开
          </Link>
        </div>
        <CardCluster clusters={clusters} />
      </section>

      <section className="bg-surface-dark text-on-dark">
        <div className="mx-auto grid max-w-[1120px] gap-10 px-5 py-16 sm:px-8 md:grid-cols-2 md:items-center">
          <div>
            <Kicker className="text-primary">Now</Kicker>
            <h2 className="mt-3 font-display text-3xl tracking-[-0.03em] text-on-dark sm:text-4xl">
              正在做
            </h2>
            <p className="mt-5 max-w-md text-[16px] leading-7 text-on-dark-soft">
              {site.author.now}
            </p>
            <Link
              to="/about"
              className="mt-8 inline-flex h-11 items-center rounded-md bg-surface-dark-elevated px-5 text-sm font-medium text-on-dark"
            >
              了解更多
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
