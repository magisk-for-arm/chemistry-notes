# 高中化学要点总结

一个面向高中化学的知识点梳理站点：把易错点讲透，把解题方法讲清楚。内容以「学科 / 知识点 / 分节」组织，每个知识点固定六个分节——概览、易错点、考点解析、解题方法、思维导图、典型例题。默认暗色主题，可切换亮色。

**线上地址**：<https://magisk-for-arm.github.io/chemistry-notes/>

当前收录 1 个学科、21 个知识点，共 158 个页面。

## 技术栈

- **Astro 7**：静态站点框架
- **MDX 内容集合**：知识点以 `src/content` 下的 MDX 文件维护
- **KaTeX + mhchem**：数学与化学公式渲染
- **smiles-drawer**：结构式渲染，全站统一 ACS Document 1996 风格
- **markmap**：思维导图渲染
- **Pagefind**：构建后生成站内搜索索引

## 快速开始

需要 Node >= 22.12.0（见 `.nvmrc`）。

```bash
npm install
npm run dev        # 本地开发
npm run check      # 类型与 Astro 检查
npm run build      # 构建站点并生成搜索索引
npm run preview    # 预览构建产物（需先 build）
```

> 本地预览线上同款效果时，用 `BASE_PATH=/chemistry-notes npx astro build` 构建，否则 CSS 链接会指向根路径、在子路径下 404。

## 目录结构

```
src/
├─ content/<subject>/<topic>/  # MDX 内容，index/mistakes/exam-points/methods/mindmap/examples
├─ components/                 # 可复用组件（Header、Sidebar、Callout、ChemStructure 等）
├─ layouts/                    # 页面布局（BaseLayout、KnowledgeLayout）
├─ pages/                      # 路由页面（通用分节页由 [section].astro 承担）
├─ styles/                     # tokens / global / prose / components
├─ utils/topics.ts             # 学科与知识点元数据（权威定义）
└─ utils/links.ts              # withBase / stripBase，站内链接必须走它
public/images/                 # 手写 SVG：实验装置图、推断流程图
templates/knowledge-point/     # 新增内容用的模板
```

## 如何新增知识点

1. 复制 `templates/knowledge-point/` 到 `src/content/chemistry/<topic>/`（`<topic>` 为新知识点的英文 slug）。
2. 把模板中所有 `REPLACE_TOPIC` 替换为该 slug。
3. 在 `src/utils/topics.ts` 的 `topics` 数组中登记一条元数据（`slug`/`subject`/`title`/`icon`/`order`/`summary`/`tags`）。

新增**学科**时，还需在 `src/utils/topics.ts` 的 `subjectList` 中登记一条学科元数据。

不需要新增任何页面文件——分节路由由 `[subject]/[topic]/[section].astro` 统一承担。

## 内容约定

- 标题（`#`、`##` 等）中不要使用 `$...$` 行内公式，否则会导致目录提取乱码；公式请放在正文中。
- 易错点用 `<MistakeCard>` 包住四个 `<Callout>`：`wrong`（错误示例）→ `why`（错因剖析）→ `right`（正确做法）→ `skill`（接题方法），其中 `skill` 段不可省略。
- 公式用 `$...$` / `$$...$$`，化学式用 `\ce{}`（如 `\ce{2H2 + O2 -> 2H2O}`）。
- **结构式**用 `<ChemStructure smiles="..." caption="..." />`，SMILES 须先经 PubChem PUG-REST 校验再入库；并把它包在限宽容器里，避免桌面端被压缩：

  ```mdx
  <div style="max-width:360px;margin:0 auto">
  <ChemStructure smiles="OCc1ccccc1" caption="苯甲醇" height="120px" />
  </div>
  ```

- **装置图与流程图**是手写 SVG，放在 `public/images/`，用 Markdown 语法引用：`![装置图说明](/images/xxx.svg)`。不要用 MDX 的 `<img src>`——它在子路径部署下会 404。图里只画示意图与极简标注，解释性文字留给正文。
- 站内链接必须经 `src/utils/links.ts` 的 `withBase()` 加前缀，不可写死根绝对路径——站点需同时支持根路径与子路径部署。

更完整的约定与踩坑记录见 [AGENTS.md](./AGENTS.md)。

## 部署

同时支持两处部署，配置不同：

- **GitHub Pages（主）**：推送 `main` 触发 `.github/workflows/deploy.yml`，构建时注入 `BASE_PATH=/<仓库名>` 与 `SITE_URL=https://<owner>.github.io`，产物 `dist/` 上传 Pages。仓库 Settings → Pages → Source 须选 **GitHub Actions**。`BASE_PATH` 由 `github.event.repository.name` 动态拼接，仓库改名也照常工作。
- **Vercel（并存）**：配置见 `vercel.json`，**不设** `BASE_PATH`，走根路径。

站点域名取 `SITE_URL`，未设置时回退到 Vercel 的 `VERCEL_URL`，本地回退 `http://localhost:4321`。
