import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ArticleBody, Kicker, ReadingProgress, useReadingProgress } from "@/components/article";
import { CommentSection } from "@/components/comments";
import { NotFound } from "@/components/not-found";
import { formatDate } from "@/lib/content";
import { loadArticle } from "@/lib/folio.functions";
import { site } from "@/lib/site";

export const Route = createFileRoute("/notes/$slug")({
  loader: ({ params }) => loadArticle({ data: params.slug }),
  component: NotePage,
});

function NotePage() {
  const article = Route.useLoaderData();
  useReadingProgress();
  if (!article) return <NotFound />;
  const { entry, related } = article;

  return (
    <main>
      <ReadingProgress />
      <article className="mx-auto max-w-[720px] px-5 py-12 sm:px-8 sm:py-16">
        <Link
          to="/notes"
          className="inline-flex h-10 items-center gap-2 text-sm font-medium text-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          卡片聚类
        </Link>
        <Kicker className="mt-8">{entry.clusterName}</Kicker>
        <h1 className="mt-3 font-display text-4xl leading-[1.1] tracking-[-0.035em] text-ink sm:text-[2.8rem]">
          {entry.title}
        </h1>
        <p className="mt-5 text-lg leading-7 text-body">{entry.dek}</p>
        <p className="mt-6 font-mono text-xs tracking-[0.08em] text-muted">
          {site.author.name} · {formatDate(entry.date)} · {entry.readingMinutes} 分钟阅读
        </p>
        <img
          src={entry.cover}
          alt={entry.coverAlt}
          className="mt-10 aspect-[16/9] w-full rounded-lg object-cover"
        />
        <div className="mt-10">
          <ArticleBody blocks={entry.body} />
        </div>
        <CommentSection slug={entry.slug} />
      </article>
      {related.length > 0 ? (
        <aside className="border-t border-hairline bg-surface-soft">
          <div className="mx-auto grid max-w-[1120px] gap-8 px-5 py-12 sm:px-8 md:grid-cols-2">
            {related.map((item) => (
              <Link
                key={item.slug}
                to={item.kind === "work" ? "/work/$slug" : "/notes/$slug"}
                params={{ slug: item.slug }}
                className="group"
              >
                <img
                  src={item.cover}
                  alt={item.coverAlt}
                  className="aspect-[16/9] w-full rounded-lg object-cover"
                />
                <h2 className="mt-3 font-display text-2xl tracking-[-0.03em] text-ink group-hover:text-primary">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">{item.dek}</p>
              </Link>
            ))}
          </div>
        </aside>
      ) : null}
    </main>
  );
}
