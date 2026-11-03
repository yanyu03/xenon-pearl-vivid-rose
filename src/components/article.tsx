import { useEffect, type ReactNode } from "react";
import type { Block } from "@/lib/content";
import { cn } from "@/lib/cn";

export function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-7 break-words [overflow-wrap:anywhere] sm:space-y-8">
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return <p className="font-sans text-[16px] leading-[1.9] tracking-[0.01em] text-body sm:text-[18px] sm:leading-[1.95]">{block.text}</p>;
    case "h2":
      return (
        <h2 className="border-t border-hairline pt-10 font-display text-[1.7rem] font-semibold leading-[1.35] tracking-[-0.035em] text-ink sm:text-[1.85rem]">
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 className="pt-4 font-sans text-xl font-semibold text-ink">{block.text}</h3>
      );
    case "quote":
      return (
        <blockquote className="border-l-[3px] border-primary bg-surface-soft py-5 pl-6 pr-5">
          <p className="font-display text-lg leading-[1.8] text-ink sm:text-[1.4rem]">
            {block.text}
          </p>
          {block.cite ? (
            <cite className="mt-3 block text-sm not-italic text-muted">— {block.cite}</cite>
          ) : null}
        </blockquote>
      );
    case "ul":
      return (
        <ul className="list-disc space-y-2 pl-5 text-[16px] leading-[1.9] sm:text-[18px] text-body marker:text-primary">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal space-y-2 pl-5 text-[17px] leading-[1.7] text-body marker:text-muted">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    case "code":
      return (
        <figure className="overflow-hidden rounded-2xl bg-surface-dark">
          <figcaption className="flex items-center justify-between border-b border-on-dark/10 px-4 py-2 font-mono text-[11px] tracking-[0.12em] text-on-dark-soft uppercase">
            <span>{block.lang}</span>
          </figcaption>
          <pre className="max-w-full overflow-x-auto p-5 font-mono text-[13px] leading-7 text-on-dark">
            <code>{block.code}</code>
          </pre>
        </figure>
      );
    case "figure":
      return (
        <figure className="overflow-hidden rounded-lg bg-surface-card">
          <img
            src={block.src}
            alt={block.alt}
            className="aspect-[16/9] w-full object-cover"
          />
          {block.caption ? (
            <figcaption className="px-1 pt-3 text-[13px] leading-5 text-muted">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    case "callout":
      return (
        <aside className="rounded-xl border border-hairline bg-surface-soft px-6 py-5 text-[16px] leading-[1.65] text-body-strong">
          {block.text}
        </aside>
      );
    default:
      return null;
  }
}

export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "font-sans text-xs font-medium tracking-[0.14em] text-primary",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function useReadingProgress() {
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const p = max > 0 ? Math.min(1, el.scrollTop / max) : 0;
      document.documentElement.style.setProperty("--read", String(p));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.documentElement.style.setProperty("--read", "0");
    };
  }, []);
}

export function ReadingProgress() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-16 right-0 left-0 z-30 h-[2px] bg-transparent"
    >
      <div
        className="h-full origin-left bg-primary"
        style={{ transform: "scaleX(var(--read, 0))" }}
      />
    </div>
  );
}
