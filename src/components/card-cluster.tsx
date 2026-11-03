import { Link } from "@tanstack/react-router";
import { useState } from "react";
import type { PublicCard, PublicCluster } from "@/domain/types";
import { cn } from "@/lib/cn";

export function CardCluster({ clusters }: { clusters: PublicCluster[] }) {
  const [activeId, setActiveId] = useState(clusters[0]?.id ?? "");
  const active = clusters.find((cluster) => cluster.id === activeId) ?? clusters[0];
  if (!active) {
    return <p className="mt-8 text-muted">还没有公开的聚类。</p>;
  }

  return (
    <div className="mt-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="tablist" aria-label="卡片聚类">
        {clusters.map((cluster) => {
          const selected = cluster.id === active.id;
          return (
            <button
              key={cluster.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveId(cluster.id)}
              className={cn(
                "rounded-2xl border border-hairline bg-surface-card p-5 text-left transition-[box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
                selected
                  ? "shadow-[0_0_0_2px_var(--color-primary)]"
                  : "shadow-[0_0_0_1px_var(--color-hairline)] hover:-translate-y-0.5",
              )}
            >
              <p className="mt-3 font-sans text-base font-medium text-ink">{cluster.name}</p>
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted">{cluster.blurb}</p>
              <p className="mt-3 font-mono text-xs tracking-[0.08em] text-muted">
                {cluster.cards.length} 张卡片
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-[24px] border border-hairline bg-surface-soft px-4 py-5 sm:px-6 sm:py-6" role="tabpanel">
        <p className="font-display text-2xl tracking-[-0.03em] text-ink sm:text-3xl">{active.name}</p>
        <p className="mt-1 max-w-lg text-sm leading-6 text-body">{active.blurb}</p>
        {active.cards.length === 0 ? (
          <p className="mt-6 text-sm text-muted">这个聚类还没有公开卡片。</p>
        ) : (
          <>
            <ul className="mt-6 divide-y divide-hairline border-t border-hairline">
              {active.cards.map((card) => (
                <li key={card.id}>
                  <CardLink card={card} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function CardLink({ card }: { card: PublicCard }) {
  const to = card.kind === "work" ? "/work/$slug" : "/notes/$slug";
  return (
    <Link
      to={to}
      params={{ slug: card.slug }}
      className="group block rounded-lg py-4 transition-colors hover:bg-white"
    >
      <div className="px-3 py-2">
        <p className="font-mono text-[11px] tracking-[0.08em] text-muted">
          {card.kind === "work" ? "作品" : "笔记"} · {card.date}
        </p>
        <p className="mt-2 font-sans text-lg font-semibold leading-7 text-ink group-hover:text-primary sm:text-xl">{card.title}</p>
      </div>
    </Link>
  );
}
