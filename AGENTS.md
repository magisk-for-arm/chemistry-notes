# AGENTS.md

面向在本仓库工作的 AI 代理。目标：不读完全部源码，也能安全、正确地改动本项目。

## 项目速览

- **是什么**：高中化学知识点复习站点（内容以「学科 / 知识点 / 分节」组织），默认暗色主题，可切换亮色。
- **技术栈**：Astro 7（静态输出）、MDX 内容集合（Content Layer + `glob` loader）、KaTeX + mhchem、markmap、Pagefind。
- **内容驱动**：新增知识点只需加 MDX 文件夹 + 在 `src/utils/topics.ts` 登记，**不需要新增页面文件**。
- **语言**：站点文案、注释、提交信息均为中文。新增内容与改动的文案请保持中文。

## 常用命令

```bash
npm install        # 安装依赖（Node >= 22.12.0，见 .nvmrc）
npm run dev        # 本地开发（http://localhost:4321）
npm run check      # Astro + TypeScript 检查；当前为 0 errors / 0 warnings / 0 hints
npm run build      # 构建产物 + 生成 Pagefind 搜索索引
npm run build:only # 只跑 astro build（调试用，无搜索索引）
npm run preview    # 预览 dist（需先 build）
npm run search     # 单独为 dist 重建搜索索引
```

- 提交前至少跑 `npm run check`；涉及路由/内容/样式时再跑 `npm run build`。
- 搜索页依赖 Pagefind 索引，`dist` 里没有索引时会显示「搜索索引未找到」，属正常现象。
- `npm run build` 会输出一条 `markdown.remarkPlugins ... are deprecated` 警告，是 Astro 7 的提示，可忽略。

## 目录地图

```
src/
├─ content.config.ts          # knowledge 集合 + Frontmatter schema（权威定义）
├─ utils/topics.ts            # 学科/知识点/分节元数据与查询函数（权威定义）
├─ content/<subject>/<topic>/ # MDX 内容，entry id = <subject>/<topic>/<category>
│   ├─ index.mdx              # category: overview（入口页，路由为 /<subject>/<topic>）
│   ├─ mistakes.mdx           # category: mistakes
│   ├─ exam-points.mdx        # category: exam-points
│   ├─ methods.mdx            # category: methods
│   ├─ mindmap.mdx            # category: mindmap（纯 Markdown 大纲，见下）
│   └─ examples.mdx           # category: examples
├─ pages/
│   ├─ index.astro                        # 首页
│   ├─ search.astro                       # 搜索页
│   ├─ [subject]/index.astro              # 学科页
│   ├─ [subject]/[topic]/index.astro      # 知识点概览
│   ├─ [subject]/[topic]/[section].astro  # 通用分节页
│   └─ tag/[tag].astro                    # 标签聚合
├─ layouts/                   # BaseLayout（HTML 外壳/主题）、KnowledgeLayout（三栏）
├─ components/                # Header/Sidebar/Toc/Callout/MistakeCard/ExampleCard/MarkmapView...
├─ styles/                    # tokens / global / prose / components 四个全局 CSS
├─ plugins/rehype-katex-mhchem.mjs  # 包装 rehype-katex，注册 mhchem（\ce{} / \pu{}）
└─ utils/                     # topics.ts 等
templates/knowledge-point/    # 新增知识点用的模板（刻意放在 src/content 之外）
docs/superpowers/             # 设计文档与实现计划（过程资料，非运行时）
.superpowers/                 # 代理工作状态，已被 gitignore
```

路由：`overview` 对应 `/{subject}/{topic}`，其余分节为 `/{subject}/{topic}/{section}`（用 `sectionHref()` 生成，勿手拼）。

## 常见任务

### 新增一个知识点

1. 复制 `templates/knowledge-point/` 到 `src/content/chemistry/<topic>/`（`<topic>` 为英文 slug）。
2. 把模板里所有 `REPLACE_TOPIC` 替换为该 slug；`topic` Frontmatter 必须与文件夹名一致。
3. 在 `src/utils/topics.ts` 的 `topics` 数组登记一条元数据（`slug`/`subject`/`title`/`icon`/`order`/`summary`/`tags`）。
4. 运行 `npm run check`，再 `npm run dev` 走一遍各分节。

### 新增一个学科

1. 新建 `src/content/<subject>/` 并在其下按知识点建目录。
2. 在 `src/utils/topics.ts` 的 `subjectList` 登记学科元数据。
3. 无需改 `content.config.ts`、无需新增页面。

### 修改主题或样式

- 颜色/间距/字体等令牌集中在 `src/styles/tokens.css`：`:root, [data-theme='dark']` 为暗色默认，`[data-theme='light']` 覆盖。**不要硬编码颜色**，用已有 CSS 变量。
- 主题通过 `<html data-theme>` 切换，值持久化在 `localStorage` 的 `theme` 键；`BaseLayout.astro` 内联脚本在首屏前应用，避免闪烁。
- 组件样式在 `src/styles/components.css`，正文排版在 `prose.css`，全局骨架在 `global.css`。
- markmap 相关样式同段：暗色下文字由 `[data-theme='dark'] .markmap` 覆盖 `--markmap-*` 变量，新增颜色请沿用该模式。

### 修改思维导图

- `mindmap.mdx` 的正文会被整体传给 `<svg data-markdown>`，由 `MarkmapView.astro` 在客户端用 markmap 渲染。因此该文件**只能是纯 Markdown 大纲**（标题 + 列表），不要写 `import`、组件或复杂 MDX。
- 渲染参数（`autoFit`、`maxWidth`、间距等）在 `MarkmapView.astro` 的 `Markmap.create` 中调整。
- 思维导图页不显示右侧目录（`KnowledgeLayout` 中 `hasToc = section !== 'mindmap'`）。

## 内容规范

Frontmatter schema 定义在 `src/content.config.ts`，字段如下：

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | string | 页面标题，建议 `知识点名 · 分节名` |
| `topic` | string | 与知识点文件夹名/`topics.ts` 的 `slug` 一致 |
| `category` | enum | `overview` / `mistakes` / `exam-points` / `methods` / `mindmap` / `examples` |
| `order` | number | 分节顺序，通常与 category 对应：overview 0、mistakes 1、exam-points 2、methods 3、mindmap 4、examples 5 |
| `summary` | string | 一句话概述，用于卡片与搜索结果 |
| `tags` | string[] | 标签，驱动 `/tag/<tag>` 聚合页 |
| `difficulty` | enum | `easy` / `medium` / `hard`，默认 `medium` |
| `examFrequency` | enum | `high` / `medium` / `low`，默认 `medium` |
| `updated` | string | 日期字符串，如 `"2026-09-13"` |

内容写作要点：

- **易错点四段式**：每条用 `<MistakeCard>` 包住四个 `<Callout>`：`wrong`（错误示例）→ `why`（错因剖析）→ `right`（正确做法）→ `skill`（接题方法）。`skill` 段是本项目的核心，不可省略。
- `<Callout>` 可用类型：`wrong` / `why` / `right` / `skill` / `tip` / `note` / `memory` / `formula`。
- **MDX 组件只用默认插槽**：不使用命名插槽，子内容直接写在组件标签内（规避 MDX 兼容问题）。解析折叠用 `<Reveal>`，例题用 `<ExampleCard>`，解题模型用 `<SolutionSteps>`。
- **标题里不要写 `$...$` 行内公式**，否则右侧目录（TOC）提取会乱码；公式放正文。
- 数学/化学公式用 `$...$`、`$$...$$`，化学式用 `\ce{}`（如 `\ce{2H2 + O2 -> 2H2O}`）。
- 内部链接优先用 `src/utils/topics.ts` 的 `sectionHref()`；标签链接为 `/tag/<tag>`。

## 硬性约束与陷阱

- **不要手改 `dist/`、`.astro/`**——都是生成物；同时被 gitignore。
- **不要为单个知识点新增页面/路由**，扩展靠加内容 + 登记 `topics.ts`。
- **不要把模板放进 `src/content/`**：`glob` loader 会把它们当正式内容采集（`templates/` 在 `src/content` 之外是刻意的）。
- **不要绕过 `src/utils/topics.ts`**：学科/知识点的标题、顺序、图标、简介以它为准，Frontmatter 只描述单页。
- `@` 是 `src` 的路径别名（`astro.config.mjs` + `tsconfig.json`），导入组件用 `@/components/...`。
- 站点默认暗色；新增/调整样式时同时确认暗色与亮色两种主题下的可读性。
- mhchem 由 `src/plugins/rehype-katex-mhchem.mjs` 统一注册，不要再单独 `import 'katex/contrib/mhchem'`，以免出现两个 KaTeX 实例。
- `docs/superpowers/` 是设计与计划文档，`.superpowers/` 是代理过程状态；一般无需改动。

## 完工前自检

1. `npm run check` 通过（0 errors）。
2. 内容/路由有改动时 `npm run build` 通过（确认 22 个页面正常生成，新页面在其中）。
3. 视觉/样式改动：`npm run dev` 或 `npm run build && npm run preview`，在暗色与亮色、桌面与移动宽度下各看一眼；涉及导图时重点看暗色可读性。
4. 变更保持聚焦，不顺手重排无关文件；提交信息用 Conventional Commits 中文描述，沿用 `feat:` / `fix:` / `content:` 等前缀（如 `content: 补充某某易错点`）。

## 部署

- 目标平台 Vercel，配置见 `vercel.json`（`framework: astro`、`buildCommand: npm run build`、`outputDirectory: dist`）。
- 站点域名取 `SITE_URL`，未设置时回退到 Vercel 的 `VERCEL_URL`，本地回退 `http://localhost:4321`。
