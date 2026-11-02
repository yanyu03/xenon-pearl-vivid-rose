import { createFileRoute, Link } from "@tanstack/react-router";
import { site } from "@/lib/site";
import { works } from "@/lib/content";
import { Kicker } from "@/components/article";

export const Route = createFileRoute("/about")({ component: AboutPage });

const principles = [
  {
    title: "先做完，再解释",
    body: "作品页写结果，笔记写代价。没有上线的东西不进作品集。",
  },
  {
    title: "工具要少",
    body: "Agent 只进入检索和起草。核对、发布、署名，仍然是我的手。",
  },
  {
    title: "纸面即产品",
    body: "这个站点没有暗色模式。奶油色、衬线标题、一条珊瑚红，就是 Folio 的全部电压。",
  },
];

function AboutPage() {
  return (
    <main>
      <section className="mx-auto grid max-w-[1120px] items-center gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Kicker>About</Kicker>
          <h1 className="mt-3 font-display text-5xl tracking-[-0.035em] text-ink sm:text-6xl">
            {site.author.name}
          </h1>
          <p className="mt-2 text-sm tracking-[0.08em] text-muted">
            {site.author.role} · {site.author.location}
          </p>
          <div className="mt-6 space-y-4 text-[17px] leading-7 text-body">
            <p>
              我做展览交互、小批器物，以及给自己用的软件。过去在产品团队里画过太多走不到用户手里的界面，后来决定把作品集收成可以翻阅的纸面。
            </p>
            <p>
              AI 是日常工具，不是题材本身。我关心的是：它从工作流的哪一段进来，哪一段必须被挡在外面。这些实验写在笔记里，失败的也留着。
            </p>
          </div>
        </div>
        <img
          src="/images/hero-desk.jpg"
          alt="林予的工作台：笔记本、钢笔与书签"
          className="aspect-[4/3] w-full rounded-xl object-cover"
        />
      </section>

      <section className="bg-surface-soft">
        <div className="mx-auto max-w-[1120px] px-5 py-16 sm:px-8">
          <h2 className="font-display text-3xl tracking-[-0.03em] text-ink">工作原则</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {principles.map((item) => (
              <article key={item.title} className="rounded-lg bg-canvas px-6 py-7">
                <h3 className="font-sans text-base font-medium text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-body">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1120px] px-5 py-16 sm:px-8">
        <h2 className="font-display text-3xl tracking-[-0.03em] text-ink">精选作品</h2>
        <ul className="mt-8 divide-y divide-hairline border-y border-hairline">
          {works.map((work) => (
            <li key={work.slug}>
              <Link
                to="/work/$slug"
                params={{ slug: work.slug }}
                className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between"
              >
                <span className="font-medium text-ink">{work.title}</span>
                <span className="text-sm text-muted">
                  {work.year} · {work.role}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-10 max-w-xl text-[16px] leading-7 text-body">
          若要讨论展览、器物或研究工具，直接写到笔记下的评论区。Folio 的讨论串是开源风格的本地实现，需要时可以切换成
          Giscus（GitHub Discussions）。
        </p>
      </section>
    </main>
  );
}
