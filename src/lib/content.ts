export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "code"; lang: string; code: string }
  | { type: "figure"; src: string; alt: string; caption?: string }
  | { type: "callout"; text: string };

export type Work = {
  slug: string;
  title: string;
  dek: string;
  year: string;
  role: string;
  outcome: string;
  cover: string;
  coverAlt: string;
  tags: string[];
  body: Block[];
};

export type Note = {
  slug: string;
  title: string;
  dek: string;
  date: string;
  readingMinutes: number;
  tags: Array<"AI" | "工程" | "随笔">;
  cover: string;
  coverAlt: string;
  featured?: boolean;
  body: Block[];
};

export type LogEntry = {
  id: string;
  date: string;
  title: string;
  body: string;
  href?: { to: "/notes/$slug" | "/work/$slug"; slug: string; label: string };
};

export const works: Work[] = [
  {
    slug: "city-soundscape",
    title: "城市声景",
    dek: "把一座城市一天的声音，画成可以走读的等高线。",
    year: "2025",
    role: "概念 / 视觉 / 前端",
    outcome: "博物馆展览交互，日均停留 4 分 12 秒",
    cover: "/images/work-soundscape.jpg",
    coverAlt: "城市天际线被抽象成暖色等高线声浪",
    tags: ["数据可视化", "展览", "声音"],
    body: [
      {
        type: "p",
        text: "委托来自一座滨江美术馆。他们有一年的城市声景采样：码头、早市、高架、小学门口，共 1,400 小时。原计划做成「点击播放」的地图，像大多数声音档案那样——点开一个大头针，听 30 秒。",
      },
      {
        type: "p",
        text: "我拒绝了这个方案。声音一旦被钉在点上，城市就变成了景点清单。真正的声景是连续的：你从巷子走到江边，低频会先到，人声后到，风把高频抹掉一层。",
      },
      { type: "h2", text: "把频谱当成地形" },
      {
        type: "p",
        text: "每个采样点被折成一条等高线。频率是海拔，响度是坡度，时间沿江岸展开。参观者不是在「播放」，而是在走一条声学的山谷。珊瑚红标出一天中最吵的三十分钟——通常是放学和晚高峰叠在一起的时候。",
      },
      {
        type: "figure",
        src: "/images/work-soundscape.jpg",
        alt: "声景等高线展览画面",
        caption: "展览主视觉。等高线由 24 小时频谱直接生成，没有手绘修饰。",
      },
      {
        type: "ul",
        items: [
          "前端：Canvas 绘制 12 万个采样点，60fps，手机可走读。",
          "声音：Web Audio 按空间距离衰减，不出现「点一下爆音」。",
          "无障碍：每条山谷提供文字描述与键盘漫游。",
        ],
      },
      {
        type: "callout",
        text: "最大的设计决策是去掉播放按钮。没有按钮，参观者才会把身体当成控制器。",
      },
      { type: "h2", text: "结果" },
      {
        type: "p",
        text: "展期 46 天。平均停留从预案的 1 分出头变成 4 分 12 秒。策展人后来把等高线印成了门票背面——这比任何奖项都具体。",
      },
    ],
  },
  {
    slug: "family-archive",
    title: "家庭档案柜",
    dek: "给一抽屉不肯被数字化的东西，做一套愿意被打开的目录。",
    year: "2025",
    role: "产品 / 档案设计",
    outcome: "家族 40 年材料可检索，且没有被做成「网盘」",
    cover: "/images/work-archive.jpg",
    coverAlt: "打开的木制标本抽屉，里面是信封与植物标本",
    tags: ["档案", "产品", "家庭"],
    body: [
      {
        type: "p",
        text: "我父亲有一只抽屉。里面是信封、药方、户口迁移、小学奖状、压平的樟树叶。他拒绝把这些「传到网上」。不是怕隐私，是怕东西变成缩略图。",
      },
      {
        type: "p",
        text: "家庭档案柜是一次妥协：扫描，但不云同步；检索，但不时间线化；每件东西保留它在抽屉里的位置——第几格、压在谁下面、哪一年的梅雨味。",
      },
      { type: "h2", text: "目录，而不是 feed" },
      {
        type: "p",
        text: "界面模仿标本柜。打开一格，看到的是实物照片，不是卡片标题。元数据写成图书馆的款式：来源、材质、存放条件。AI 只做一件事：从扫描件里读出手写年份，标成「待确认」，等父亲点头。",
      },
      {
        type: "figure",
        src: "/images/work-archive.jpg",
        alt: "家庭档案抽屉",
        caption: "真实抽屉的照片被用作导航，而不是图标。位置本身就是索引。",
      },
      {
        type: "quote",
        text: "数字化不该是把东西变小，而是把打开它的仪式留下来。",
        cite: "项目笔记，2025.4",
      },
      {
        type: "p",
        text: "现在这只抽屉仍然锁着。电脑里多了一份可以搜索的副本，但打开方式跟拉开木匣一样慢。我认为这是成功。",
      },
    ],
  },
  {
    slug: "night-lamp",
    title: "夜读灯",
    dek: "一盏只照纸、不照脸的灯。为了把手机留在另一个房间。",
    year: "2024",
    role: "工业设计 / 固件",
    outcome: "小批量 80 盏，返修率 0",
    cover: "/images/work-lamp.jpg",
    coverAlt: "暗室里一盏黄铜胡桃木阅读灯照亮一张空白纸",
    tags: ["器物", "硬件", "阅读"],
    body: [
      {
        type: "p",
        text: "市面上的阅读灯大多在讨好摄像头：色温可调、App 可控、灯臂能自拍。我要的是相反的东西——一盏不愿意被拍照的灯，只把光铺在 16 开的纸面上，脸和房间保持暗。",
      },
      { type: "h2", text: "约束" },
      {
        type: "ul",
        items: [
          "只有一档开关。没有色温滚轮，没有场景模式。",
          "2700K，CRI 95。光斑直径约 32cm，边缘衰减，不切桌子。",
          "黄铜灯臂、胡桃木座。底座足够重，单手拨灯不会走位。",
          "固件 120 行。上电、软启动、过温保护。没有 OTA。",
        ],
      },
      {
        type: "figure",
        src: "/images/work-lamp.jpg",
        alt: "夜读灯点亮桌面",
        caption: "唯一需要被拍下来的时刻：灯亮着、纸是空的。",
      },
      {
        type: "p",
        text: "小批量 80 盏，卖给认识的人。有人说它「像家具不像产品」，这是我听过最好的评论。",
      },
    ],
  },
];

export const notes: Note[] = [
  {
    slug: "prompts-are-specs",
    title: "提示词不是咒语，是规格书",
    dek: "把 Prompt 当魔法口令，模型会陪你演戏；把它写成接口约定，它才会开始干活。",
    date: "2026-09-12",
    readingMinutes: 8,
    tags: ["AI", "工程"],
    cover: "/images/note-spec.jpg",
    coverAlt: "带有几何辅助线的规格图纸与一支钢笔",
    featured: true,
    body: [
      {
        type: "p",
        text: "过去一年我看过太多「神级 Prompt」。它们共同的修辞是祈求：请你扮演专家、请你一步步思考、请你务必、请你不要。像对一个脾气不稳的天才说话。",
      },
      {
        type: "p",
        text: "真正能进工作流的提示词，读起来像规格书。它声明输入、输出、失败时怎么办、什么叫做完。模型不是被感动了，是被约束了。",
      },
      { type: "h2", text: "一份能跑的规格" },
      {
        type: "p",
        text: "我现在给 Agent 的系统说明只保留四段：角色边界、输入契约、输出模式、禁止事项。形容词全部删掉。「专业、详尽、优雅」对模型没有运算意义，对作者的虚荣倒是很有用。",
      },
      {
        type: "code",
        lang: "yaml",
        code: `role: 技术编辑
input:
  - draft: markdown
  - audience: 独立开发者
output:
  format: markdown
  sections: [问题, 做法, 代价]
fail:
  - 事实不确定 → 标记「待核」
forbid:
  - 表情符号
  - 无来源的数字`,
      },
      {
        type: "callout",
        text: "如果一段提示词不能被同事评审，它就不该被放进仓库。咒语无法 code review。",
      },
      { type: "h2", text: "测试，而不是调教" },
      {
        type: "p",
        text: "我为常用任务准备了 12 个黄金样例。每次改系统说明，先跑这一组。分数下降就回滚——跟改编译器前端一个道理。感觉「更聪明了」不是发布标准。",
      },
      {
        type: "quote",
        text: "模型会表演理解。规格书的价值是让表演无处可藏。",
      },
      {
        type: "p",
        text: "下一次你想加一句「请认真思考」，先问：这句话能被测试否决吗？不能的话，删掉。纸面会干净很多，输出也会。",
      },
    ],
  },
  {
    slug: "agent-week",
    title: "用 Agent 重构一周工作流",
    dek: "不是让它替我写代码，是让它把我从「找文件、贴上下文、等编译」里赎出来。",
    date: "2026-08-21",
    readingMinutes: 7,
    tags: ["AI", "工程"],
    cover: "/images/note-workflow.jpg",
    coverAlt: "日光下的工作台：日历、纸片与合上的笔记本计算机",
    body: [
      {
        type: "p",
        text: "周一到周五，我把日常拆成四类：检索、起草、核对、发布。Agent 只被允许进入前两类。核对和发布仍然是我的手。这个边界比任何模型选型都重要。",
      },
      { type: "h2", text: "一张桌面，两个角色" },
      {
        type: "p",
        text: "上午的 Agent 负责把仓库、笔记、邮件变成一份「今日输入」。下午的 Agent 根据我圈出的三件事起草补丁或段落。它看不到日历之外的消息，也不能直接 git push。",
      },
      {
        type: "figure",
        src: "/images/note-workflow.jpg",
        alt: "一周工作台",
        caption: "工具变少之后，桌子看起来像 2014 年。这是有意的。",
      },
      {
        type: "ol",
        items: [
          "08:40 生成昨日未关闭项与今日三个目标。",
          "10:00 前只处理检索类任务，禁止打开新聊天。",
          "14:00 把圈定的草稿交给下午的 Agent，限定文件范围。",
          "17:30 我自己跑测试、写提交说明、点发布。",
        ],
      },
      {
        type: "p",
        text: "一周下来，有效写作时间大约多出 6 小时。不是因为模型更快，是因为我不再把上午浪费在「先找一下那份笔记在哪」。",
      },
    ],
  },
  {
    slug: "multi-model-failure",
    title: "一次失败的多模型协作实验",
    dek: "三个模型轮流改同一份文档，最后谁也不记得初稿在说什么。",
    date: "2026-07-03",
    readingMinutes: 6,
    tags: ["AI", "随笔"],
    cover: "/images/note-models.jpg",
    coverAlt: "三叠不同纸色的手稿和一支珊瑚红铅笔",
    body: [
      {
        type: "p",
        text: "实验设定很时髦：模型 A 起草，模型 B 反对，模型 C 综合。我以为这是编辑部。它其实是传话筒。",
      },
      {
        type: "p",
        text: "到第四轮，文中已经没有一个我在乎的句子。反对者擅长删除锋利的部分，综合者擅长把剩下的平均成正确的废话。初稿里那句难听但准确的判断，失踪了。",
      },
      {
        type: "figure",
        src: "/images/note-models.jpg",
        alt: "三叠手稿",
        caption: "三份稿子放在一起时，最像「完成」的那份往往最空。",
      },
      { type: "h2", text: "后来怎么改" },
      {
        type: "ul",
        items: [
          "只允许一个模型接触成稿。另一个只准提交「问题清单」，不准改字。",
          "反对意见必须附原文定位，禁止「整体更流畅一些」。",
          "综合权在我。模型没有合并权限。",
        ],
      },
      {
        type: "p",
        text: "协作的质量不取决于模型数量。编辑部能运转，是因为有人会说「这段留下」。",
      },
    ],
  },
  {
    slug: "third-rebuild",
    title: "个人站点第三次推倒重来",
    dek: "前两次死于组件库，这一次决定先写文章，再让页面配得上这些文章。",
    date: "2026-06-18",
    readingMinutes: 5,
    tags: ["工程", "随笔"],
    cover: "/images/studio-night.jpg",
    coverAlt: "夜晚工作室：一盏灯、一盆植物、一张矮桌",
    body: [
      {
        type: "p",
        text: "2019 年的站点是卡片墙。2023 年的站点是博客主题加暗色模式。它们有一个共同点：比我的文章好看，也比我的文章先过时。",
      },
      {
        type: "p",
        text: "Folio 的原则反过来。先有十篇愿意署名的文字和三件愿意展示的作品，再找一套配得上它们的纸面——暖色、衬线标题、一条珊瑚红，不再提供「主题切换」。奶油色就是这个站点的产品。",
      },
      {
        type: "figure",
        src: "/images/studio-night.jpg",
        alt: "夜晚的工作室",
        caption: "站点的气氛应该像这间屋子：灯是暖的，东西很少。",
      },
      {
        type: "callout",
        text: "评论区接入开源方案，而不是某家社交登录。讨论应当跟文章待在一起，而不是被抽走。",
      },
      {
        type: "p",
        text: "如果四年后再推倒，我希望理由是文章变了，而不是框架变了。",
      },
    ],
  },
];

export const logEntries: LogEntry[] = [
  {
    id: "2026-09-20",
    date: "2026-09-20",
    title: "Folio 上线第一版",
    body: "导航、作品、笔记、纪事、关于，以及可回复的开源风格评论区。奶油纸面，不再做暗色模式。",
  },
  {
    id: "2026-09-12",
    date: "2026-09-12",
    title: "发表《提示词不是咒语，是规格书》",
    body: "把一年里写过的系统说明收成一篇。以后新的 Agent 角色都按这个模板进仓库。",
    href: { to: "/notes/$slug", slug: "prompts-are-specs", label: "阅读笔记" },
  },
  {
    id: "2026-08-21",
    date: "2026-08-21",
    title: "一周工作流实验结束",
    body: "Agent 只进入检索和起草。发布权收回。有效写作时间大约多出 6 小时。",
    href: { to: "/notes/$slug", slug: "agent-week", label: "阅读笔记" },
  },
  {
    id: "2025-11-02",
    date: "2025-11-02",
    title: "城市声景撤展",
    body: "46 天，平均停留 4 分 12 秒。门票背面印了等高线。项目归档。",
    href: { to: "/work/$slug", slug: "city-soundscape", label: "查看作品" },
  },
  {
    id: "2025-04-18",
    date: "2025-04-18",
    title: "家庭档案柜交给父亲",
    body: "他用了一个下午确认手写年份。抽屉钥匙还在他那里。",
    href: { to: "/work/$slug", slug: "family-archive", label: "查看作品" },
  },
  {
    id: "2024-12-09",
    date: "2024-12-09",
    title: "夜读灯 80 盏发完",
    body: "返修率 0。下一批如果做，只改底座配重，不加工具 App。",
    href: { to: "/work/$slug", slug: "night-lamp", label: "查看作品" },
  },
];

export const noteTags = ["全部", "AI", "工程", "随笔"] as const;

export function getWork(slug: string) {
  return works.find((item) => item.slug === slug);
}

export function getNote(slug: string) {
  return notes.find((item) => item.slug === slug);
}

export function getFeaturedNote() {
  return notes.find((item) => item.featured) ?? notes[0];
}

export function formatDate(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}

export function formatDateShort(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${year}.${month}.${day}`;
}
