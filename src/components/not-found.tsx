import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-[1120px] flex-col justify-center px-5 py-24 sm:px-8">
      <p className="font-sans text-xs font-medium tracking-[0.14em] text-muted uppercase">
        404
      </p>
      <h1 className="mt-4 font-display text-4xl leading-[1.1] tracking-[-0.03em] text-ink sm:text-5xl">
        这一页还没被写下来。
      </h1>
      <p className="mt-5 max-w-md text-body">也许是旧链接，也许是我删掉了。回首页看看正在展出的作品和笔记。</p>
      <Link
        to="/"
        className="mt-8 inline-flex h-11 w-fit items-center rounded-md bg-primary px-5 text-sm font-medium text-on-primary transition-colors duration-150 hover:bg-primary-active"
      >
        回首页
      </Link>
    </main>
  );
}
