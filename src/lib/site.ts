export const site = {
  name: "Folio",
  nameZh: "造物纪",
  tagline: "作品集 · AI 实验 · 项目纪事",
  description:
    "林予的个人站点：作品集、AI 实验笔记，以及把事情做完的项目纪事。",
  author: {
    name: "林予",
    role: "独立设计师 / 工程师",
    location: "杭州",
    now: "在做一套给自己用的研究笔记工具，并重写这个站点的阅读体验。",
  },
  nav: [
    { to: "/", label: "首页", exact: true },
    { to: "/work", label: "作品" },
    { to: "/notes", label: "笔记" },
    { to: "/log", label: "纪事" },
    { to: "/about", label: "关于" },
  ] as const,
  comments: {
    /**
     * "local" — 开源风格的讨论串（可回复、可回应），保存在此浏览器。
     * "giscus" — 接入 GitHub Discussions（需填写 repo 与 id）。
     */
    provider: "local" as "local" | "giscus",
    giscus: {
      repo: "",
      repoId: "",
      category: "Announcements",
      categoryId: "",
      mapping: "pathname",
      theme: "light",
      lang: "zh-CN",
    },
  },
} as const;
