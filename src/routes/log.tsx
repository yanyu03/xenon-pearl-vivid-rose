import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDate, logEntries } from "@/lib/content";
import { Kicker } from "@/components/article";

export const Route = createFileRoute("/log")({ component: LogPage });

function LogPage() {
  return (
    <main className="mx-auto max-w-[720px] px-5 py-14 sm:px-8 sm:py-20">
      <Kicker>Field notes</Kicker>
      <h1 className="mt-3 font-display text-5xl tracking-[-0.035em] text-ink sm:text-6xl">项目纪事</h1>
      <p className="mt-5 text-[17px] leading-7 text-body">
        按时间记下上线、撤展、交付。不是动态，是可以回翻的工作日志。
      </p>
      <ol className="relative mt-14 border-l border-hairline pl-8">
        {logEntries.map((entry) => (
          <li key={entry.id} className="relative pb-12 last:pb-0">
            <span
              className="absolute top-1.5 -left-[2.15rem] size-2.5 rounded-full bg-primary"
              aria-hidden="true"
            />
            <time className="font-mono text-xs tracking-[0.08em] text-muted">
              {formatDate(entry.date)}
            </time>
            <h2 className="mt-2 font-display text-2xl tracking-[-0.03em] text-ink">
              {entry.title}
            </h2>
            <p className="mt-2 text-[16px] leading-7 text-body">{entry.body}</p>
            {entry.href ? (
              <Link
                to={entry.href.to}
                params={{ slug: entry.href.slug }}
                className="mt-3 inline-flex text-sm font-medium text-primary hover:text-primary-active"
              >
                {entry.href.label}
              </Link>
            ) : null}
          </li>
        ))}
      </ol>
    </main>
  );
}
