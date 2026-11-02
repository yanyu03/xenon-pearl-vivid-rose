import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ArticleBody, Kicker, ReadingProgress, useReadingProgress } from "@/components/article";
import { CommentSection } from "@/components/comments";
import { NotFound } from "@/components/not-found";
import { loadArticle } from "@/lib/folio.functions";

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }) => loadArticle({ data: params.slug }),
  component: WorkPage,
});

function WorkPage() {
  const article = Route.useLoaderData();
  useReadingProgress();
  if (!article || article.entry.kind !== "work") return <NotFound />;
  const work = article.entry;
  const others = article.related.filter((item) => item.kind === "work");

  return (
    <main>
      <ReadingProgress />
      <article className="mx-auto max-w-[720px] px-5 py-12 sm:px-8 sm:py-16">
        <Link
          to="/work"
          className="inline-flex h-10 items-center gap-2 text-sm font-medium text-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          作品集
        </Link>
        <Kicker className="mt-8">Case study · {work.year}</Kicker>
        <h1 className="mt-3 font-display text-4xl leading-[1.1] tracking-[-0.035em] text-ink sm:text-5xl">
          {work.title}
        </h1>
        <p className="mt-5 text-lg leading-7 text-body">{work.dek}</p>
        <dl className="mt-8 grid grid-cols-1 gap-4 border-y border-hairline py-5 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted">角色</dt>
            <dd className="mt-1 text-ink">{work.role}</dd>
          </div>
          <div>
            <dt className="text-muted">年份</dt>
            <dd className="mt-1 text-ink">{work.year}</dd>
          </div>
          <div>
            <dt className="text-muted">结果</dt>
            <dd className="mt-1 text-ink">{work.outcome}</dd>
          </div>
        </dl>
        <img
          src={work.cover}
          alt={work.coverAlt}
          className="mt-10 aspect-[16/10] w-full rounded-lg object-cover"
        />
        <div className="mt-10">
          <ArticleBody blocks={work.body} />
        </div>
        <CommentSection slug={work.slug} />
      </article>
      <aside className="border-t border-hairline bg-surface-soft">
        <div className="mx-auto grid max-w-[1120px] gap-8 px-5 py-12 sm:px-8 md:grid-cols-2">
          {others.map((item) => (
            <Link key={item.slug} to="/work/$slug" params={{ slug: item.slug }} className="group">
              <img
                src={item.cover}
                alt={item.coverAlt}
                className="aspect-[16/10] w-full rounded-lg object-cover"
              />
              <p className="mt-3 text-xs tracking-[0.12em] text-muted">{item.year}</p>
              <h2 className="mt-1 font-display text-2xl tracking-[-0.03em] text-ink group-hover:text-primary">
                {item.title}
              </h2>
            </Link>
          ))}
        </div>
      </aside>
    </main>
  );
}
