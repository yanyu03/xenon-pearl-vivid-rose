import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";

function isActive(pathname: string, to: string, exact?: boolean) {
  if (exact || to === "/") return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (desktop.matches) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onChange);
    return () => {
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onChange);
    };
  }, [open]);

  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-body">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-on-primary"
      >
        跳到正文
      </a>
      <header className="sticky top-0 z-40 border-b border-hairline/80 bg-canvas/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-baseline gap-2 text-ink transition-opacity hover:opacity-70">
            <span className="font-display text-[1.65rem] font-bold leading-none tracking-[-0.06em]">
              {site.name}
            </span>
            <span className="hidden font-sans text-xs tracking-[0.14em] text-muted sm:inline">
              {site.nameZh}
            </span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex" aria-label="主导航">
            {site.nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative py-2 text-sm font-medium text-muted transition-colors duration-150 hover:text-ink",
                  isActive(pathname, item.to, "exact" in item && item.exact) &&
                    "text-ink after:absolute after:inset-x-0 after:-bottom-[1.15rem] after:h-[3px] after:rounded-full after:bg-primary",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            className={cn(
              "relative inline-flex size-11 items-center justify-center rounded-full text-ink md:hidden",
              open && "invisible",
            )}
            aria-label="打开菜单"
            aria-expanded={open}
            aria-controls="mobile-menu"
            tabIndex={open ? -1 : 0}
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {open ? <MobileMenu pathname={pathname} onClose={() => setOpen(false)} /> : null}

      <div id="content" className="flex-1">
        {children}
      </div>

      <footer className="bg-surface-dark text-on-dark">
        <div className="mx-auto grid max-w-[1120px] gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-3xl tracking-[-0.03em]">{site.name}</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-on-dark-soft">
              {site.tagline}
              <br />
              {site.author.name} · {site.author.role} · {site.author.location}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-on-dark-soft uppercase">
              栏目
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {site.nav.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="inline-flex min-h-11 items-center text-on-dark hover:text-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-on-dark-soft uppercase">
              现在
            </p>
            <p className="mt-4 text-sm leading-6 text-on-dark-soft">{site.author.now}</p>
          </div>
        </div>
        <div className="border-t border-on-dark/10">
          <div className="mx-auto flex max-w-[1120px] flex-col gap-2 px-5 py-5 text-xs text-on-dark-soft sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <span>© {new Date().getFullYear()} {site.author.name}</span>
            <span>Built for curiosity · Xblog</span>
            <Link to="/admin" className="inline-flex min-h-11 items-center text-on-dark hover:text-primary">
              后台
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MobileMenu({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  return createPortal(
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="站点菜单"
      className="fixed inset-0 z-50 flex flex-col bg-canvas md:hidden"
    >
      <div className="flex h-16 items-center justify-between border-b border-hairline px-5">
        <p className="font-display text-[1.65rem] leading-none tracking-[-0.04em] text-ink">{site.name}</p>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-full text-ink"
          aria-label="关闭菜单"
          onClick={onClose}
        >
          <X className="size-5" />
        </button>
      </div>
      <nav className="flex flex-col px-3 py-3" aria-label="移动导航">
        {site.nav.map((item) => {
          const active = isActive(pathname, item.to, "exact" in item && item.exact);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 items-center justify-between rounded-lg px-3 font-display text-3xl tracking-[-0.03em] text-ink active:bg-surface-soft",
                active && "text-primary",
              )}
            >
              {item.label}
              {active ? (
                <span className="font-mono text-xs tracking-[0.12em] text-primary">当前</span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>,
    document.body,
  );
}