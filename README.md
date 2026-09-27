# 高中学科要点总结

> 高中知识点复习站点。覆盖化学与数学两个学科，30 个知识点，每个拆成概览、易错点、考点解析、解题方法、思维导图、典型例题六页，配结构式、实验装置图与思维导图。

[![deploy](https://github.com/magisk-for-arm/chemistry-notes/actions/workflows/deploy.yml/badge.svg)](https://github.com/magisk-for-arm/chemistry-notes/actions/workflows/deploy.yml) [![在线站点](https://img.shields.io/badge/%E5%9C%A8%E7%BA%BF%E7%AB%99%E7%82%B9-GitHub%20Pages-0f766e)](https://magisk-for-arm.github.io/chemistry-notes/) [![Astro](https://img.shields.io/badge/Astro-7-ff5d01)](https://astro.build) [![Node](https://img.shields.io/badge/node-%3E%3D22.12-339933)](https://nodejs.org)

内容按「学科 / 知识点 / 分节」三层组织，MDX 写作，Astro 静态输出，部署在 GitHub Pages 与 Vercel。目前 2 个学科、30 个知识点、180 篇内容，加上 51 个标签页和首页、两个学科页、搜索页，共 235 个页面。

代码与正文由 LLM 代理生成、人工审校，可能存在错误，请以教材与真题为准，详见[内容来源与准确性](#内容来源与准确性)。

## 特性

- 内容分层：学科 → 知识点 → 分节，每个知识点固定六页，路由由一个 `[section].astro` 统一生成
- 多学科：学科与知识点的标题、顺序、图标、简介统一登记在 `src/utils/topics.ts`，路由本身与学科无关
- 公式排版：KaTeX + mhchem，行内 `$...$`；化学学科用化学式 `\ce{}`，数学学科只用纯数学公式
- 结构式：smiles-drawer 客户端渲染，全站统一 ACS Document 1996 风格
- 实验配图：装置图与推断流程图手写 SVG，固定浅底，亮暗主题下都可读
- 思维导图：markmap 渲染，`mindmap` 页整页展示，不占右侧目录
- 检索：Pagefind 构建后生成索引，站内搜索加标签聚合页
- 主题：亮暗双主题，首屏前应用本地选择，不闪烁
- 双轨部署：GitHub Pages 子路径与 Vercel 根路径都能跑

## 快速开始

需要 Node >= 22.12.0（见 `.nvmrc`）与 npm。

```bash
npm install
npm run dev        # 开发服务器，http://localhost:4321
npm run check      # astro check，类型与 Astro 诊断
npm run build      # 静态构建 + 生成搜索索引
npm run preview    # 预览 dist
```

`astro check` **不校验 MDX 语法**（漏写一个 `</Callout>` 仍然报 0 errors，只有 build 才失败）。批量写内容时先跑一遍标签配对自检，能在秒级定位到错配的行号：

```bash
node scripts/check-mdx-tags.mjs src/content
```

本地想复现线上的子路径效果，构建时带上 base：

```bash
BASE_PATH=/chemistry-notes npx astro build
npm run preview
```

未带 `BASE_PATH` 的产物按根路径引用资源，部署到子路径下会 CSS 404、整页无样式，这是本项目最容易误判的故障。

## 内容结构

每个知识点固定六个 MDX 文件，元数据（标题、顺序、简介、标签、难度）在 Frontmatter 里定义：

| 分节 | 文件 | 路由后缀 | 内容 |
| --- | --- | --- | --- |
| 概览 | `index.mdx` | 无 | 概念、公式与方程式 |
| 易错点 | `mistakes.mdx` | `/mistakes` | 错例、错因、正确做法、接题方法四段 |
| 考点解析 | `exam-points.mdx` | `/exam-points` | 该知识点在题里的出法与口径 |
| 解题方法 | `methods.mdx` | `/methods` | 可套用的解题模型 |
| 思维导图 | `mindmap.mdx` | `/mindmap` | 整页导图，正文是纯 Markdown 大纲 |
| 典型例题 | `examples.mdx` | `/examples` | 带完整解析的例题 |

## 目录结构

```
src/
├─ content/chemistry/<topic>/  # 化学正文，126 个 mdx
├─ content/math/<topic>/       # 数学正文，54 个 mdx
├─ pages/                      # 路由，首页、搜索、学科、知识点、分节、标签
├─ components/                 # Callout、MistakeCard、ChemStructure、MarkmapView 等
├─ layouts/                    # 页面外壳与三栏布局
├─ styles/                     # 主题令牌与排版
├─ plugins/                    # rehype 插件：mhchem、base 前缀
├─ utils/topics.ts             # 学科与知识点元数据，权威定义
└─ utils/links.ts              # 站内链接的 base 前缀处理
public/images/                 # 手写 SVG：装置图、推断流程图
scripts/check-mdx-tags.mjs     # MDX 标签配对自检（build 前跑，比 astro check 更快定位）
templates/knowledge-point/     # 新增知识点用的模板
```

## 新增一个知识点

1. 复制 `templates/knowledge-point/` 为 `src/content/<subject>/<topic>/`，`<subject>` 取已登记的学科 slug，`<topic>` 用英文 slug。
2. 替换模板中全部 `REPLACE_TOPIC`，并让 Frontmatter 的 `topic` 与文件夹同名。
3. 在 `src/utils/topics.ts` 的 `topics` 数组登记一条：`slug`、`subject`、`title`、`icon`、`order`、`summary`、`tags`。

不需要新增页面文件，六页路由由 `[section].astro` 生成，站内链接用 `sectionHref()` 拼。新增学科在同文件的 `subjectList` 登记，同样不需要改路由或 `content.config.ts`。

## 编写规范

- 标题里不放 `$...$`，否则右侧目录提取乱码，公式写在正文
- 易错点用 `<MistakeCard>` 包四个 `<Callout>`，顺序为 `wrong`、`why`、`right`、`skill`，最后一段不能省
- 数学公式写 `$...$` 或 `$$...$$`；化学式写 `\ce{}`（`\ce{2H2 + O2 -> 2H2O}`），仅化学学科使用
- 数学学科不使用 `<ChemStructure>` 与 `\ce{}`，配图如确需则手写 SVG 存 `public/images/`
- 结构式用 `<ChemStructure smiles="..." caption="..." />`，SMILES 先经 PubChem 验证，外面套限宽容器，否则桌面端会被压扁：

  ```mdx
  <div style="max-width:360px;margin:0 auto">
  <ChemStructure smiles="OCc1ccccc1" caption="苯甲醇" height="120px" />
  </div>
  ```

- 装置图与流程图手写 SVG 存 `public/images/`，用 Markdown 图片语法引用（`![装置图说明](/images/xxx.svg)`），`<img src>` 在子路径部署下会 404
- 站内链接走 `withBase()`，写死 `/xxx` 在 GitHub Pages 上会挂；Markdown 正文里的绝对链接由 rehype 插件自动补前缀
- 界面上不用 emoji，图标走 `<Icon name="..." />`

## 内容来源与准确性

正文与代码由 LLM 代理生成，人负责审校，因此内容会有错。已经修掉的问题包括把液氯的颜色写成「黄色」、把氯碱产物的阴阳极写反、俗名表里「倭铅、硇水、绿矾」张冠李戴。以教材与真题为准，发现错误欢迎提 issue。

结构式相对可靠，SMILES 逐条在 PubChem 渲染验证，验不过的写法进不了库。

**化学学科**沿袭自一条公开的笔记链。[Anyayay 的化学笔记](https://github.com/AnyayayPlus/Chemistry-Note) 是原始版本，[MeowCata 的 Chemistry-Note-Refine](https://github.com/MeowCata/Chemistry-Note-Refine) 把它重建成 VitePress 站点，本站 20 个知识点的正文由此改编，按本站格式重写并逐条勘误，改了什么写在各知识点 `index.mdx` 末尾。上游自己注明「部分内容使用了 Chat-GPT 等工具辅助书写」，所以这条链从一开始就有 AI 参与，本站做的是校对与补齐。拿不准的内容没有搬过来，阿伏加德罗常数是本站原创。

**数学学科**（`src/content/math/`）没有上游笔记链可改编，9 个知识点的正文按人教 A 版选择性必修与高考大纲的考点顺序重新组织，属于本站原创。每个知识点的 `examples.mdx` 末尾另设「**真题演练**」小节，收入 33 道公开高考真题（2021—2026 年新高考Ⅰ/Ⅱ卷、全国甲卷共 8 套卷），题面与官方答案逐条核对、并另用数值法独立复算。数学内容的最大风险是计算与推理出错，请以教材为准。

## 致谢与参考资料

原作者 Anyayay，VitePress 重建与勘误 MeowCata（[上游站点](https://Chemistry-Note.seeridia.top)，[联系邮箱](mailto:seeridia@gmail.com)）。上游 README 列出的主要参考：

- 人教版、鲁科版、苏教版、沪科技版《普通高中教科书 化学》，[国家中小学智慧教育平台](https://www.zxx.edu.cn/elecEdu)
- 天星教育《解题觉醒·化学》、众望教育《高考必刷题》、一本涂书、教材划重点
- 维基百科 与 [维基教科书《高中化学》](https://zh.wikibooks.org/wiki/高中化学)
- 邢其毅等《基础有机化学》第 4 版，北京大学出版社，2016
- Bilibili UP 主 [@一化儿](https://space.bilibili.com/1526560679/)

## 部署

| 平台 | 触发 | 路径 | 说明 |
| --- | --- | --- | --- |
| GitHub Pages | 推 `main` | 子路径 | 主部署，`.github/workflows/deploy.yml` 注入 `BASE_PATH` 与 `SITE_URL`；Settings → Pages 的 Source 选 GitHub Actions |
| Vercel | 仓库连接 | 根路径 | 并存，`vercel.json` 不设 `BASE_PATH` |

站点地址取 `SITE_URL`，未设置时退回 `VERCEL_URL`，本地退回 `http://localhost:4321`。

## 贡献

改动前先读 [AGENTS.md](./AGENTS.md)，里面是内容规范、配图规则和完工自检清单。要补内容或修错误，直接提 issue 或 PR。
