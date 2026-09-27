# AGENTS.md

面向在本仓库工作的 AI 代理。目标：不读完全部源码，也能安全、正确地改动本项目。

## 项目速览

- **是什么**：高中学科知识点复习站点（内容以「学科 / 知识点 / 分节」组织），默认暗色主题，可切换亮色。
- **规模**：2 学科（化学、数学）、30 个知识点、180 个页面内容文件；每个知识点 6 个分节（概览 / 易错点 / 考点 / 方法 / 思维导图 / 例题）。
- **技术栈**：Astro 7（静态输出）、MDX 内容集合（Content Layer + `glob` loader）、KaTeX + mhchem、markmap、Pagefind。
- **内容驱动**：新增知识点只需加 MDX 文件夹 + 在 `src/utils/topics.ts` 登记，**不需要新增页面文件**。
- **配图**：化学的结构式走 `<ChemStructure>`（smiles-drawer 客户端渲染），装置图与流程图是手写 SVG 放在 `public/images/`。
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

node scripts/check-mdx-tags.mjs src/content   # MDX 标签配对自检（秒级，check 不查 MDX 语法）
```

- 提交前至少跑 `npm run check`；涉及路由/内容/样式时再跑 `npm run build`。
- 搜索页依赖 Pagefind 索引，`dist` 里没有索引时会显示「搜索索引未找到」，属正常现象。
- `npm run build` 会输出一条 `markdown.remarkPlugins ... are deprecated` 警告，是 Astro 7 的提示，可忽略。

## 目录地图

```
src/
├─ content.config.ts          # knowledge 集合 + Frontmatter schema（权威定义，学科无关）
├─ utils/topics.ts            # 学科/知识点/分节元数据与查询函数（权威定义）+ SITE_NAME / subjectLabel()
├─ content/<subject>/<topic>/ # MDX 内容，entry id = <subject>/<topic>/<category>
│   ├─ index.mdx              # category: overview（入口页，路由为 /<subject>/<topic>）
│   ├─ mistakes.mdx           # category: mistakes
│   ├─ exam-points.mdx        # category: exam-points
│   ├─ methods.mdx            # category: methods
│   ├─ mindmap.mdx            # category: mindmap（纯 Markdown 大纲，见下）
│   └─ examples.mdx           # category: examples
├─ pages/
│   ├─ index.astro                        # 首页：学科卡片 + 按学科分组的知识点区
│   ├─ search.astro                       # 搜索页
│   ├─ [subject]/index.astro              # 学科页（getStaticPaths 由 subjectList 驱动）
│   ├─ [subject]/[topic]/index.astro      # 知识点概览
│   ├─ [subject]/[topic]/[section].astro  # 通用分节页
│   └─ tag/[tag].astro                    # 标签聚合
├─ layouts/                   # BaseLayout（HTML 外壳/主题）、KnowledgeLayout（三栏）
├─ components/                # Header/Sidebar/Toc/Callout/MistakeCard/ExampleCard/MarkmapView...
├─ styles/                    # tokens / global / prose / components 四个全局 CSS
├─ plugins/rehype-katex-mhchem.mjs  # 包装 rehype-katex，注册 mhchem（\ce{} / \pu{}）
└─ utils/                     # topics.ts、links.ts（withBase/stripBase）、icons.ts 等
public/images/                # 手写 SVG：实验装置图、推断流程图（Markdown 语法引用）
scripts/check-mdx-tags.mjs    # MDX 标签配对自检（astro check 不查 MDX 语法，见「完工前自检」）
templates/knowledge-point/    # 新增知识点用的模板（刻意放在 src/content 之外）
docs/superpowers/             # 设计文档与实现计划（过程资料，非运行时）
.superpowers/、.openchamber/  # 代理工作状态与浏览器截图，均已 gitignore
```

路由：`overview` 对应 `/{subject}/{topic}`，其余分节为 `/{subject}/{topic}/{section}`（用 `sectionHref()` 生成，勿手拼）。**路由层与学科无关**：`[subject]` 段直接吃 `subjectList` 的 slug，`content.config.ts` 的 `glob` 也扫全 `src/content`，所以新增学科不需要碰任何页面文件。

## 常见任务

### 新增一个知识点

1. 复制 `templates/knowledge-point/` 到 `src/content/<subject>/<topic>/`（`<subject>` 取已登记的学科 slug，`<topic>` 为英文 slug）。
2. 把模板里所有 `REPLACE_TOPIC` 替换为该 slug；`topic` Frontmatter 必须与文件夹名一致。
3. 在 `src/utils/topics.ts` 的 `topics` 数组登记一条元数据（`slug`/`subject`/`title`/`icon`/`order`/`summary`/`tags`）。
4. 跑 `node scripts/check-mdx-tags.mjs src/content` 与 `npm run check`，再 `npm run dev` 走一遍各分节。

### 新增一个学科

1. 新建 `src/content/<subject>/` 并在其下按知识点建目录。
2. 在 `src/utils/topics.ts` 的 `subjectList` 登记学科元数据。
3. 无需改 `content.config.ts`、无需新增页面、无需改任何路由——`Header` 的学科导航与首页的知识点分区都是遍历 `subjectList` 生成的。

### 修改主题或样式

- 颜色/间距/字体等令牌集中在 `src/styles/tokens.css`：`:root, [data-theme='dark']` 为暗色默认，`[data-theme='light']` 覆盖。**不要硬编码颜色**，用已有 CSS 变量。
- 主题通过 `<html data-theme>` 切换，值持久化在 `localStorage` 的 `theme` 键；`BaseLayout.astro` 内联脚本在首屏前应用，避免闪烁。
- 组件样式在 `src/styles/components.css`，正文排版在 `prose.css`，全局骨架在 `global.css`。
- markmap 相关样式同段：暗色下文字由 `[data-theme='dark'] .markmap` 覆盖 `--markmap-*` 变量，新增颜色请沿用该模式。

### 修改思维导图

- `mindmap.mdx` 的正文会被整体传给 `<svg data-markdown>`，由 `MarkmapView.astro` 在客户端用 markmap 渲染。因此该文件**只能是纯 Markdown 大纲**（标题 + 列表），不要写 `import`、组件或复杂 MDX。
- 渲染参数（`autoFit`、`maxWidth`、间距等）在 `MarkmapView.astro` 的 `Markmap.create` 中调整。
- 思维导图页不显示右侧目录（`KnowledgeLayout` 中 `hasToc = section !== 'mindmap'`）。

### 插入化学结构图

> 本节只适用于**化学**学科。数学学科不用 `<ChemStructure>`，也不用 `\ce{}`；需要配图时按下方「插入装置图与流程图」手写 SVG。

- 用 `<ChemStructure smiles="..." caption="..." />` 渲染结构式（组件在 `src/components/ChemStructure.astro`，基于 smiles-drawer 客户端渲染，自动跟随亮暗主题重绘）。
- **全站默认 ACS Document 1996 风格**：单色（线/字用前景色，随亮/暗主题自适应）、Helvetica 系字体、略粗的键，由 `ChemStructure.astro` 里的 `ACS_1996_OPTIONS` 统一控制；如需微调样式改这一处即可。
- **SMILES 必须先经外部渲染器验证**（如 PubChem PUG-REST）再入库，禁止凭记忆书写；非常规结构（如 $\ce{N8}$、晶胞）SMILES 无法表达时，改用 `<img>` 引用 `public/images/` 下的静态 SVG。
- **必须把组件包在限宽容器里**，否则桌面端结构式会缩成一小团、四周大片留白：

  ```mdx
  <div style="max-width:360px;margin:0 auto">
  <ChemStructure smiles="OCc1ccccc1" caption="苯甲醇" height="120px" />
  </div>
  ```

  原因是组件按 `el.clientWidth` 建画布，而 `src/styles/components.css` 里 `.chem-canvas svg` 有 `max-width: 360px`。桌面正文栏约 705px 宽，两者错配就会把整幅从 705 压到 360，分子被缩掉近一半。限宽到 360 后画布宽与渲染宽相等，分子恢复原尺寸。移动端容器本就约 300px、与上限吻合，所以**只有桌面端会出问题**——别因为移动端看着正常就以为没事。
- `height` 建议一律 `120px`（组件内部下限）。容器变窄后分子不再被压缩，给更高的高度只会在上下留白；线型小分子（如甘氨酸）尤其明显。

### 插入装置图与流程图

实验装置图、推断流程图一律**手写 SVG** 存到 `public/images/`，在 MDX 里用 **Markdown 图片语法**引用（见下方硬性约束，`<img src>` 在子路径部署下会 404）。

- **只画主体，不画图例**：图里不要写正文已经讲过的长段解释。图例、注意事项、结论表归正文，SVG 只留示意图与极简标注。判断标准——如果一句话删掉图里的文字、MDX 正文里仍能学到，那句就该删。
- **尺寸口径**：装置图统一 `viewBox` 宽 700；流程图内容是文字卡片，画布较宽，用 `viewBox` 宽 960 左右即可。
- **缩放整幅靠 `width`/`height` 属性，不改 `viewBox`**：`viewBox` 是坐标系，`width`/`height` 才是渲染尺寸。要让图变小（如流程图从铺满整栏收到 787px），只改这两个属性，浏览器会等比缩放整幅（含文字），一处改动即可，不要去动 `viewBox` 和上百个坐标。
- **SVG 画布是固定浅色底**：`<img>` 里的 SVG 无法响应 `data-theme`，所以图必须自带底色与边框（`.bg` + `.frame` 两个矩形）。全站统一「浅纸面底 + 深墨线条」，在亮暗两种主题下都不刺眼。
- **alt 文本必须与图的实际内容一致**：图改了就同步改 alt。alt 是读屏与 Pagefind 索引的依据，描述已删除的内容等于输出错误信息。
- 加 `role="img"` 与 `aria-label`，让独立打开 SVG 时也有无障碍描述。
- 改完跑一遍越界自检（见「完工前自检」）。

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
- **数学学科的真题块**：`examples.mdx` 末尾的「真题演练」小节收入真实高考题，`source` 写「年份 + 卷种 + 题号」（如 `2024 新高考Ⅰ卷 第 15 题`）。选题按 **90/150 水平线**：单选/多选/填空全取，解答题只取 13–15 分档，**17 分压轴不入**；需要配图的题（`\choicebitmap`、`\textfigure`）一律跳过。真题答案要与官方解析交叉复算，**不要直接照抄官方解析**，要补上「为什么这么做」。
- **从 LaTeX 源码搬题时注意宏**：多数真题仓库用 `\e`（自然常数）、`\i`（虚数单位）、`\bs`（粗体向量）这三个前导宏，**本项目 KaTeX 都没定义**，直接搬会整片渲染失败。须分别改写为 `\mathrm{e}`、裸 `i`、`\vec{}`（与既有内容写法一致）。搬完立刻跑 `node scripts/check-katex.mjs`。
- 数学/化学公式用 `$...$`、`$$...$$`，化学式用 `\ce{}`（如 `\ce{2H2 + O2 -> 2H2O}`）。
- 内部链接优先用 `src/utils/topics.ts` 的 `sectionHref()`；标签链接为 `/tag/<tag>`。

## 硬性约束与陷阱

- **UI 层禁用 emoji**：控件、Callout、分节、知识点图标一律用 `<Icon name="..." />`（组件 `src/components/Icon.astro`，图标名与图形见 `src/utils/icons.ts`），`.astro` / `.ts` / `.css` 里不许出现 emoji；图标名变更需同步 `topics.ts` 的 `icon` 字段。
- **不要手改 `dist/`、`.astro/`**——都是生成物；同时被 gitignore。
- **不要为单个知识点新增页面/路由**，扩展靠加内容 + 登记 `topics.ts`。
- **不要把模板放进 `src/content/`**：`glob` loader 会把它们当正式内容采集（`templates/` 在 `src/content` 之外是刻意的）。
- **不要绕过 `src/utils/topics.ts`**：学科/知识点的标题、顺序、图标、简介以它为准，Frontmatter 只描述单页。
- **站点名与学科标签不要硬编码**：拼页面 `<title>` 后缀、页脚、品牌文字时用 `topics.ts` 导出的 `SITE_NAME`（跨学科页，如首页/搜索/标签）与 `subjectLabel(subject)`（学科页，化学页得「高中化学要点」、数学页得「高中数学要点」）。数学页的 `<title>`、面包屑、页脚**不得出现「高中化学」**。
- **不要在 UI 里写死某个学科**：`Header` 的学科导航遍历 `subjectList`，首页「知识点」区按学科分组遍历。给化学加第三个学科时不该需要改这两个文件。
- **加学科前先算头部宽度**：`Header` 的学科导航是**平铺**的（不是抽屉），而知识点页在 ≤760px 会用 `.has-drawer .site-nav { display: none }` 藏掉它，**首页/学科页/标签页/搜索页则不藏**。所以新增学科会让这些页面在窄屏横向溢出。`global.css` 已按断点收紧：≤560px 压间距与导航内边距、≤390px 只留品牌标记，且品牌/导航规则都用 `body:not(.has-drawer)` 限定，**保证化学知识点页头部逐像素不变**。再加学科时重新估算一次 `.header-inner` 宽度，触控区 40px 不要动。
- **`icon` 必须是 `src/utils/icons.ts` 已注册的 `IconName`**，缺则先按该文件既有风格（Lucide 24×24 / `stroke 1.75` / `currentColor`，只留 `<svg>` 内部子元素）新增条目，再引用。图标名变更需同步 `topics.ts` 的 `icon` 字段。
- **数学学科不用化学专用能力**：不写 `\ce{}`、不用 `<ChemStructure>`；公式一律用 KaTeX 的 `$...$` / `$$...$$`。
- `@` 是 `src` 的路径别名（`astro.config.mjs` + `tsconfig.json`），导入组件用 `@/components/...`。
- 站点默认暗色；新增/调整样式时同时确认暗色与亮色两种主题下的可读性。
- mhchem 由 `src/plugins/rehype-katex-mhchem.mjs` 统一注册，不要再单独 `import 'katex/contrib/mhchem'`，以免出现两个 KaTeX 实例。
- **站内链接必须经 `src/utils/links.ts` 的 `withBase()`，不得写死根绝对路径 `/xxx`**：`href="/foo"`、`` href={`/foo`} `` 一律不合法，要写 `href={withBase('/foo')}`；Markdown 正文里的 `[xx](/foo)` 由 `src/plugins/rehype-base-links.mjs` 统一补前缀，无需手动改。理由见「部署」章节——本项目要同时跑在根路径（Vercel）与子路径（GitHub Pages）下。
- **图片必须用 Markdown 语法 `![说明](/images/x.svg)`，不要写 MDX 的 `<img src="/images/x.svg">`**：`src/plugins/rehype-base-links.mjs` 只改写 hast 元素的 `href`/`src`，MDX 的 JSX 元素不走这条路径，因此 `<img>` 里的根绝对路径在子路径部署下会 404。
- **SVG 的 `.bg` / `.frame` 矩形高度必须等于 `viewBox` 高度**（`frame` 再减 1.5 留描边边距）。改 `viewBox` 高度时忘了同步这两个矩形，底边框会被裁掉——画面看起来「图贴着边」，但很难一眼看出是 bug。
- `docs/superpowers/` 是设计与计划文档，`.superpowers/`、`.openchamber/` 是代理过程状态与浏览器截图（均已 gitignore）；一般无需改动。

## 完工前自检

1. `npm run check` 通过（0 errors）。注意它**不校验 MDX 语法**（漏写 `</Callout>` 仍报 0 errors，只有 build 才失败），所以内容改动以 `npm run build` 为准。
2. 批量写/改 MDX 先跑标签自检，它比 build 快几个数量级，且顺带查四段式齐不齐、mindmap 是否混入组件、标题是否含行内公式：

   ```bash
   node scripts/check-mdx-tags.mjs src/content
   ```

3. 内容/路由有改动时 `npm run build` 通过（当前生成 235 个页面；页数随内容增长，重点确认新页面在其中）。核对页数时用实算而非估算：`158 + 6N + 新增学科页数 + 新增标签页数`，其中新标签页数 = 全部 Frontmatter 标签并集减去原有标签集。
4. **本地预览必须带 base**：`BASE_PATH=/chemistry-notes npx astro build`。用 `npm run build`（不带 `BASE_PATH`）会把 `dist` 重建成根路径版本，CSS 链接变成 `/_astro/...`，在 `/chemistry-notes/` 下 404 → 整页无样式。**这是本项目最主要的假故障来源**，页面「没样式」先查这一项，再怀疑别处。两者要分开跑：`npm run build` 会覆盖 `dist` 并附带生成 Pagefind 索引，跑完按需重建。
5. 视觉/样式改动：`npm run dev` 或 `npm run build && npm run preview`，在暗色与亮色、桌面与移动宽度下各看一眼；涉及导图时重点看暗色可读性。
6. 改过 SVG 就跑越界自检，确认没有元素超出 `viewBox`、没有文字溢出画布（中文按 1 em、拉丁按 0.55 em 估宽即可暴露问题）：

   ```bash
   # 逐张核对 viewBox / bg / frame / 渲染尺寸四者一致
   grep -oE 'viewBox="[^"]*"|class="bg"[^/]*|class="frame"[^/]*' public/images/*.svg
   ```

7. 变更保持聚焦，不顺手重排无关文件；提交信息用 Conventional Commits 中文描述，沿用 `feat:` / `fix:` / `content:` 等前缀（如 `content: 补充某某易错点`）。图文分开的改动拆成两个提交。

## 部署

- **线上地址**：`https://magisk-for-arm.github.io/chemistry-notes/`
- **GitHub Pages（主）**：推送 `main` 触发 `.github/workflows/deploy.yml`，构建时注入 `BASE_PATH=/<仓库名>` 与 `SITE_URL=https://<owner>.github.io`，产物 `dist/` 上传 Pages。仓库 Settings → Pages → Source 必须选 **GitHub Actions**（仓库已设为 `build_type: workflow`）。`BASE_PATH` 用 `github.event.repository.name` 动态拼接，不写死仓库名，改名也照常工作。
- **子路径实测**：站内链接与资源全部带 `/chemistry-notes/` 前缀；无尾斜杠的页面路径（如 `/chemistry-notes/chemistry`）由 Pages **301 补斜杠**后返回 200，属正常行为。验证方式：`curl -sI <线上地址>/chemistry` 看状态码。数学学科页同理，如 `curl -sI <线上地址>/math/set-logic/mistakes`。
- **Vercel（并存）**：配置见 `vercel.json`（`framework: astro`、`buildCommand: npm run build`、`outputDirectory: dist`）。**不设** `BASE_PATH`，走根路径，行为与历史版本一致。
- **base 规则**：`astro.config.mjs` 读 `BASE_PATH`（未设回落 `'/'`）作为 `base`；站内链接一律经 `src/utils/links.ts` 的 `withBase()` 加前缀，**新增链接必须走它，禁止手拼 `/xxx`**（这是本站能同时在两种路径下工作的前提）。导航高亮等需要反推站内相对路径的场景用 `stripBase()` 剥离 base。Markdown 正文里的站内绝对链接由 `src/plugins/rehype-base-links.mjs` 在渲染管线中统一补前缀（内容文件保持纯 MDX，不手改）。
- 站点域名取 `SITE_URL`，未设置时回退到 Vercel 的 `VERCEL_URL`，本地回退 `http://localhost:4321`。
