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
          const covers = cluster.cards.slice(0, 3);
          return (
            <button
              key={cluster.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveId(cluster.id)}
              className={cn(
                "rounded-2xl border border-hairline bg-surface-card p-4 text-left transition-[box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
                selected
                  ? "shadow-[0_0_0_2px_var(--color-primary)]"
                  : "shadow-[0_0_0_1px_var(--color-hairline)] hover:-translate-y-0.5",
              )}
            >
              <div className="flex h-24 items-center justify-center">
                <div className="relative h-16 w-28">
                  {covers.length === 0 ? (
                    <span className="absolute inset-0 rounded-md bg-surface-cream" />
                  ) : (
                    covers.map((card, index) => (
                      <img
                        key={card.id}
                        src={card.cover}
                        alt=""
                        className="absolute top-0 h-16 w-20 rounded-md object-cover"
                        style={{ left: index * 16, zIndex: covers.length - index }}
                      />
                    ))
                  )}
                </div>
              </div>
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
            <div className="mt-6 hidden items-end justify-center gap-5 px-2 pb-3 pt-2 md:flex">
              {active.cards.map((card, index) => (
                <PlacedCard key={card.id} card={card} index={index} count={active.cards.length} />
              ))}
            </div>
            <ul className="mt-5 space-y-4 md:hidden">
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

function PlacedCard({ card, index, count }: { card: PublicCard; index: number; count: number }) {
  const mid = (count - 1) / 2;
  const delta = count <= 1 ? 0 : index - mid;
  const y = Math.abs(delta) * 14;
  const rotate = delta * 3.2;
  return (
    <div
      className="w-56 origin-bottom transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] [transform:var(--fan)] hover:[transform:translateY(-8px)_rotate(0deg)]"
      style={{ ["--fan" as string]: `translateY(${y}px) rotate(${rotate}deg)` }}
    >
      <CardLink card={card} />
    </div>
  );
}

function CardLink({ card }: { card: PublicCard }) {
  const to = card.kind === "work" ? "/work/$slug" : "/notes/$slug";
  return (
    <Link
      to={to}
      params={{ slug: card.slug }}
      className="block overflow-hidden rounded-2xl bg-canvas shadow-[0_0_0_1px_var(--color-hairline)]"
    >
      <img src={card.cover} alt={card.coverAlt} className="aspect-[3/2] w-full object-cover" />
      <div className="px-3 py-3">
        <p className="font-mono text-[11px] tracking-[0.08em] text-muted">
          {card.kind === "work" ? "作品" : "笔记"} · {card.date}
        </p>
        <p className="mt-1 font-sans text-sm font-medium leading-5 text-ink">{card.title}</p>
      </div>
    </Link>
  );
}
