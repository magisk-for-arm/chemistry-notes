# 高中化学知识总结网站 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 构建一个可扩展的高中化学要点总结网站，首期完整呈现「阿伏加德罗常数」的易错点、考点、解题方法、思维导图与典型例题。

**架构：** 使用 Astro 7 内容集合（Content Layer API + `glob` loader）驱动全部内容，MDX 文件按「学科/知识点/分节」组织；页面通过 `[subject]/[topic]/[section]` 动态路由生成，新增知识点只需加文件夹 + 在 `topics.ts` 登记。默认暗色主题，KaTeX+mhchem 渲染公式，markmap 渲染思维导图，Pagefind 提供静态搜索。

**技术栈：** Astro 7、@astrojs/mdx 8、TypeScript、KaTeX + remark-math + rehype-katex、markmap-lib / markmap-view、Pagefind。

**工作目录：** `/home/lin/project/chemistry-notes`

---

## 文件结构

将要创建的文件及职责：

| 文件 | 职责 |
|------|------|
| `package.json` | 依赖与 npm 脚本 |
| `astro.config.mjs` | Astro/MDX 集成、KaTeX 插件、`@` 别名、mhchem |
| `tsconfig.json` | 严格 TS + `@/*` 路径别名 |
| `src/content.config.ts` | `knowledge` 集合定义与 Frontmatter schema |
| `src/utils/topics.ts` | 学科/知识点/分节元数据与查询函数 |
| `src/styles/tokens.css` | 设计令牌（暗色默认 + 亮色覆盖） |
| `src/styles/global.css` | 全局重置、布局骨架、站点头部/底部 |
| `src/styles/prose.css` | 正文排版、KaTeX、代码块、表格 |
| `src/styles/components.css` | 所有 UI 组件样式 |
| `src/layouts/BaseLayout.astro` | HTML 外壳、主题初始化、全局 CSS |
| `src/layouts/KnowledgeLayout.astro` | 知识点页三栏布局（侧栏+正文+目录） |
| `src/components/Header.astro` | 顶部导航 + 主题切换 |
| `src/components/Sidebar.astro` | 知识点与分节导航 |
| `src/components/Breadcrumb.astro` | 面包屑 |
| `src/components/TagBadge.astro` | 标签/难度/考频徽章 |
| `src/components/Callout.astro` | 提示框（含四段式配色） |
| `src/components/MistakeCard.astro` | 易错点卡片容器 |
| `src/components/SolutionSteps.astro` | 解题模型/步骤 |
| `src/components/Reveal.astro` | 可折叠解析块 |
| `src/components/ExampleCard.astro` | 例题卡片容器 |
| `src/components/MarkmapView.astro` | 思维导图渲染 |
| `src/components/Toc.astro` | 当前页目录 |
| `src/components/KnowledgeCard.astro` | 首页知识点卡片 |
| `src/pages/index.astro` | 首页 |
| `src/pages/[subject]/index.astro` | 学科模块页 |
| `src/pages/[subject]/[topic]/index.astro` | 知识点概览页 |
| `src/pages/[subject]/[topic]/[section].astro` | 通用分节页 |
| `src/pages/tag/[tag].astro` | 标签聚合页 |
| `src/pages/search.astro` | 搜索页（Pagefind） |
| `src/content/chemistry/avogadro/index.mdx` | 阿伏加德罗常数概览内容 |
| `src/content/chemistry/avogadro/mistakes.mdx` | 12 条易错点 + 接题方法 |
| `src/content/chemistry/avogadro/exam-points.mdx` | 四类考点解析 |
| `src/content/chemistry/avogadro/methods.mdx` | 解题方法专题 |
| `src/content/chemistry/avogadro/mindmap.mdx` | 思维导图大纲 |
| `src/content/chemistry/avogadro/examples.mdx` | 5 道典型例题 |
| `templates/knowledge-point/*.mdx` | 新增知识点时复制的模板（放在 `src/content` 之外，避免被 glob 采集） |
| `vercel.json` | Vercel 部署配置 |

> **关键决策说明（相对设计文档的细化）：**
> 1. 使用**单一 `knowledge` 集合**、`base: './src/content'`，entry id 形如 `chemistry/avogadro/mistakes`，从而「新增学科」只需新建目录，无需改 `content.config.ts`。
> 2. MDX 中自定义组件**必须在文件内显式 import**（`components` prop 只能覆盖 HTML 元素）——因此 `MistakeCard` / `ExampleCard` 采用「容器 + 内部组合 `Callout` / `Reveal`」的方式，全部只用默认插槽，规避命名插槽的兼容风险，同时保持四段式视觉结构。
> 3. 模板放在 `templates/` 而非 `src/content/`，避免被 `glob` loader 当作正式内容采集。

---

## 任务 1：初始化 Astro 项目与依赖

**文件：**
- 创建：`package.json`、`astro.config.mjs`、`tsconfig.json`、`src/pages/index.astro`

- [ ] **步骤 1：初始化 npm 并安装依赖**

运行（在 `/home/lin/project/chemistry-notes`）：

```bash
npm init -y
npm install astro@^7 @astrojs/mdx@^8 katex@^0.18 remark-math@^6 rehype-katex@^7 markmap-lib@^0.18 markmap-view@^0.18
npm install -D @astrojs/check typescript pagefind@^1
```

- [ ] **步骤 2：写入 `package.json` 脚本与类型**

```json
{
  "name": "chemistry-notes",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build && pagefind --site dist",
    "build:only": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "search": "pagefind --site dist"
  }
}
```

（保留 `npm install` 写入的 `dependencies` / `devDependencies` 字段，只增改上面的 `name/type/version/private/scripts`。）

- [ ] **步骤 3：写入 `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { fileURLToPath } from 'node:url';
// 注册 mhchem 宏（\ce{}、\pu{}）
import 'katex/contrib/mhchem';

export default defineConfig({
  site: 'https://chemistry-notes.example.com',
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatex, { throwOnError: false, strict: false }]],
  },
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
});
```

- [ ] **步骤 4：写入 `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **步骤 5：写入临时占位首页 `src/pages/index.astro`**

```astro
---
---
<!doctype html>
<html lang="zh-CN">
  <head><meta charset="utf-8" /><title>chemistry-notes</title></head>
  <body><h1>scaffold ok</h1></body>
</html>
```

- [ ] **步骤 6：验证构建通过**

运行：`npm run check && npm run build:only`

预期：`astro check` 无错误；`astro build` 输出 `Complete!`，生成 `dist/index.html`。

---

## 任务 2：设计令牌、全局样式与主题系统

**文件：**
- 创建：`src/styles/tokens.css`、`src/styles/global.css`、`src/styles/prose.css`、`src/styles/components.css`
- 创建：`src/layouts/BaseLayout.astro`
- 修改：`src/pages/index.astro`（改用 BaseLayout）

- [ ] **步骤 1：写入 `src/styles/tokens.css`**

```css
:root,
[data-theme='dark'] {
  --bg: #0f1419;
  --bg-elev: #141b23;
  --surface: #1a2029;
  --surface-2: #212a35;
  --border: #2a3543;
  --border-soft: #202834;
  --text: #e6e9ee;
  --text-muted: #9aa7b4;
  --text-dim: #6b7a89;
  --primary: #4a9eff;
  --primary-strong: #6cb2ff;
  --primary-soft: rgba(74, 158, 255, 0.14);
  --danger: #ff6b6b;
  --danger-soft: rgba(255, 107, 107, 0.12);
  --success: #4ade80;
  --success-soft: rgba(74, 222, 128, 0.12);
  --warning: #fbbf24;
  --warning-soft: rgba(251, 191, 36, 0.12);
  --purple: #c084fc;
  --purple-soft: rgba(192, 132, 252, 0.12);
  --code-bg: #10161d;
  --radius: 12px;
  --radius-sm: 8px;
  --shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
  --maxw: 1400px;
  --contentw: 74ch;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
}

[data-theme='light'] {
  --bg: #f6f8fb;
  --bg-elev: #ffffff;
  --surface: #ffffff;
  --surface-2: #eef2f7;
  --border: #d9e0e8;
  --border-soft: #e8edf3;
  --text: #18202a;
  --text-muted: #55606d;
  --text-dim: #8a95a3;
  --primary: #1e5fbc;
  --primary-strong: #1a4f9e;
  --primary-soft: rgba(30, 95, 188, 0.1);
  --danger: #d92d2d;
  --danger-soft: rgba(217, 45, 45, 0.08);
  --success: #188a4b;
  --success-soft: rgba(24, 138, 75, 0.08);
  --warning: #b45309;
  --warning-soft: rgba(180, 83, 9, 0.08);
  --purple: #7c3aed;
  --purple-soft: rgba(124, 58, 237, 0.08);
  --code-bg: #f0f3f7;
  --shadow: 0 6px 24px rgba(20, 30, 50, 0.08);
}
```

- [ ] **步骤 2：写入 `src/styles/global.css`**

```css
*,
*::before,
*::after { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  line-height: 1.75;
  -webkit-font-smoothing: antialiased;
}

a { color: var(--primary); text-decoration: none; }
a:hover { color: var(--primary-strong); text-decoration: underline; }

img { max-width: 100%; display: block; }

/* ---------- 站点头部 ---------- */
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--bg) 86%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}
.header-inner {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 0.65rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}
.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--text);
  font-weight: 700;
  letter-spacing: 0.02em;
}
.brand:hover { text-decoration: none; color: var(--text); }
.brand-mark {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: linear-gradient(135deg, var(--primary), var(--purple));
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
}
.site-nav { display: flex; gap: 0.35rem; margin-left: auto; }
.nav-link {
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  color: var(--text-muted);
  font-size: 0.92rem;
}
.nav-link:hover { background: var(--surface-2); color: var(--text); text-decoration: none; }
.nav-link.active { background: var(--primary-soft); color: var(--primary-strong); }
.header-actions { display: flex; gap: 0.35rem; }
.icon-btn {
  display: inline-grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
  color: var(--text);
  font-size: 1rem;
  cursor: pointer;
}
.icon-btn:hover { border-color: var(--primary); color: var(--primary-strong); text-decoration: none; }

/* ---------- 主区域与页脚 ---------- */
.site-main { max-width: var(--maxw); margin: 0 auto; padding: 1.5rem 1.25rem 4rem; }
.site-footer {
  border-top: 1px solid var(--border);
  color: var(--text-dim);
  font-size: 0.85rem;
  text-align: center;
  padding: 1.5rem 1rem;
}

/* ---------- 首页 ---------- */
.hero { padding: 3rem 0 2rem; text-align: center; }
.hero h1 {
  margin: 0 0 0.75rem;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  background: linear-gradient(135deg, var(--text), var(--primary-strong));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.hero p { margin: 0 auto; max-width: 46rem; color: var(--text-muted); }
.section-title { margin: 2.5rem 0 1rem; font-size: 1.25rem; }
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

/* ---------- 知识点页三栏 ---------- */
.knowledge-shell {
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr) 210px;
  gap: 2rem;
  align-items: start;
}
.knowledge-main { min-width: 0; }
@media (max-width: 1080px) {
  .knowledge-shell { grid-template-columns: 230px minmax(0, 1fr); }
  .toc { display: none; }
}
@media (max-width: 760px) {
  .knowledge-shell { display: block; }
  .sidebar { display: none; }
}

/* ---------- 无障碍与动效 ---------- */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
```

- [ ] **步骤 3：写入 `src/styles/prose.css`**

```css
.prose { max-width: var(--contentw); }
.prose h2 {
  margin: 2.5rem 0 1rem;
  padding-bottom: 0.45rem;
  border-bottom: 1px solid var(--border);
  font-size: 1.45rem;
  scroll-margin-top: 5rem;
}
.prose h3 { margin: 1.8rem 0 0.75rem; font-size: 1.18rem; scroll-margin-top: 5rem; }
.prose h4 { margin: 1.4rem 0 0.6rem; font-size: 1.02rem; color: var(--text-muted); }
.prose p { margin: 0.9rem 0; }
.prose ul, .prose ol { padding-left: 1.4rem; margin: 0.9rem 0; }
.prose li { margin: 0.35rem 0; }
.prose li::marker { color: var(--primary); }
.prose strong { color: var(--text); font-weight: 700; }
.prose blockquote {
  margin: 1.2rem 0;
  padding: 0.5rem 1rem;
  border-left: 3px solid var(--primary);
  background: var(--surface);
  color: var(--text-muted);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}
.prose code {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--code-bg);
  border: 1px solid var(--border-soft);
  border-radius: 5px;
  padding: 0.1em 0.4em;
}
.prose pre {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  overflow-x: auto;
}
.prose pre code { background: none; border: none; padding: 0; }
.prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.2rem 0;
  font-size: 0.94rem;
}
.prose th, .prose td { border: 1px solid var(--border); padding: 0.55rem 0.7rem; text-align: left; }
.prose th { background: var(--surface-2); }
.prose hr { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }

/* KaTeX 暗色适配 */
.katex { color: var(--text); }
.katex-display { overflow-x: auto; overflow-y: hidden; padding: 0.25rem 0; }
```

- [ ] **步骤 4：写入 `src/styles/components.css`**

```css
/* ---------- 徽章 ---------- */
.tag-badge {
  display: inline-block;
  padding: 0.12rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text-muted);
  font-size: 0.78rem;
  line-height: 1.6;
}
a.tag-badge:hover { border-color: var(--primary); color: var(--primary-strong); text-decoration: none; }
.tag-badge.diff-easy, .tag-badge.freq-low { color: var(--success); border-color: var(--success); background: var(--success-soft); }
.tag-badge.diff-medium { color: var(--warning); border-color: var(--warning); background: var(--warning-soft); }
.tag-badge.freq-high, .tag-badge.diff-hard { color: var(--danger); border-color: var(--danger); background: var(--danger-soft); }
.tag-badge.freq-medium { color: var(--warning); border-color: var(--warning); background: var(--warning-soft); }

/* ---------- 面包屑 ---------- */
.breadcrumb { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0 0 1rem; font-size: 0.85rem; color: var(--text-dim); }
.breadcrumb a { color: var(--text-muted); }
.breadcrumb .sep { color: var(--text-dim); }

/* ---------- 侧栏与目录 ---------- */
.sidebar { position: sticky; top: 5rem; font-size: 0.9rem; }
.sidebar-block + .sidebar-block { margin-top: 1.5rem; }
.sidebar-title { margin: 0 0 0.6rem; font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-dim); }
.sidebar-list { list-style: none; margin: 0; padding: 0; }
.sidebar-list a { display: flex; align-items: center; gap: 0.45rem; padding: 0.35rem 0.55rem; border-radius: var(--radius-sm); color: var(--text-muted); }
.sidebar-list a:hover { background: var(--surface-2); color: var(--text); text-decoration: none; }
.sidebar-list a.active { background: var(--primary-soft); color: var(--primary-strong); font-weight: 600; }

.toc { position: sticky; top: 5rem; font-size: 0.85rem; }
.toc-title { margin: 0 0 0.6rem; font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-dim); }
.toc ul { list-style: none; margin: 0; padding: 0; border-left: 1px solid var(--border); }
.toc li a { display: block; padding: 0.28rem 0.7rem; color: var(--text-muted); }
.toc li.depth-3 a { padding-left: 1.4rem; font-size: 0.8rem; }
.toc li a:hover { color: var(--primary-strong); text-decoration: none; }

/* ---------- 知识点卡片 ---------- */
.knowledge-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.1rem 1.2rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  transition: border-color 0.15s, transform 0.15s;
}
.knowledge-card:hover { border-color: var(--primary); transform: translateY(-2px); text-decoration: none; color: var(--text); }
.knowledge-card .kc-icon {
  display: inline-grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--primary-soft);
  color: var(--primary-strong);
  font-weight: 800;
}
.knowledge-card h3 { margin: 0.2rem 0 0; font-size: 1.05rem; }
.knowledge-card p { margin: 0; color: var(--text-muted); font-size: 0.88rem; }

/* ---------- 文章头 ---------- */
.article-head { margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border); }
.article-head h1 { margin: 0 0 0.5rem; font-size: clamp(1.5rem, 3vw, 2rem); }
.article-summary { margin: 0; color: var(--text-muted); }
.meta-row { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.9rem; }

/* ---------- Callout ---------- */
.callout {
  margin: 0.9rem 0;
  border: 1px solid var(--border);
  border-left-width: 4px;
  border-radius: var(--radius-sm);
  background: var(--surface);
  overflow: hidden;
}
.callout-head { padding: 0.5rem 0.9rem; font-weight: 700; font-size: 0.9rem; }
.callout-body { padding: 0.15rem 0.9rem 0.7rem; }
.callout-body > :first-child { margin-top: 0.35rem; }
.callout-body > :last-child { margin-bottom: 0.35rem; }
.callout-wrong { border-left-color: var(--danger); background: var(--danger-soft); }
.callout-wrong .callout-head { color: var(--danger); }
.callout-why { border-left-color: var(--warning); background: var(--warning-soft); }
.callout-why .callout-head { color: var(--warning); }
.callout-right { border-left-color: var(--success); background: var(--success-soft); }
.callout-right .callout-head { color: var(--success); }
.callout-skill { border-left-color: var(--primary); background: var(--primary-soft); }
.callout-skill .callout-head { color: var(--primary-strong); }
.callout-tip { border-left-color: var(--purple); background: var(--purple-soft); }
.callout-tip .callout-head { color: var(--purple); }
.callout-note { border-left-color: var(--text-dim); }
.callout-memory { border-left-color: var(--purple); background: var(--purple-soft); }
.callout-memory .callout-head { color: var(--purple); }
.callout-formula { border-left-color: var(--primary); background: var(--surface-2); }
.callout-formula .callout-head { color: var(--primary-strong); }

/* ---------- 易错点卡片 ---------- */
.mistake-card {
  margin: 1.75rem 0;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-elev);
  padding: 1rem 1.1rem 1.2rem;
  box-shadow: var(--shadow);
}
.mistake-head { display: flex; align-items: center; gap: 0.7rem; flex-wrap: wrap; }
.mistake-head h3 { margin: 0; font-size: 1.08rem; flex: 1; }
.mistake-num {
  display: inline-grid;
  place-items: center;
  min-width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--primary);
  color: #fff;
  font-weight: 800;
  font-size: 0.9rem;
}
.freq { font-size: 0.75rem; padding: 0.1rem 0.5rem; border-radius: 999px; border: 1px solid var(--border); }
.freq-high { color: var(--danger); border-color: var(--danger); background: var(--danger-soft); }
.freq-medium { color: var(--warning); border-color: var(--warning); background: var(--warning-soft); }
.freq-low { color: var(--success); border-color: var(--success); background: var(--success-soft); }
.mistake-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; margin: 0.6rem 0 0.2rem; }
.mistake-tags .tag { font-size: 0.74rem; color: var(--text-dim); border: 1px dashed var(--border); border-radius: 999px; padding: 0.05rem 0.5rem; }

/* ---------- 解题步骤 ---------- */
.solution-steps {
  margin: 1.4rem 0;
  padding: 1rem 1.2rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}
.ss-title { margin: 0 0 0.7rem; font-size: 1.05rem; color: var(--primary-strong); }
.ss-list { counter-reset: ss; list-style: none; margin: 0; padding: 0; }
.ss-list li { position: relative; padding: 0.4rem 0 0.4rem 2.2rem; border-bottom: 1px dashed var(--border-soft); }
.ss-list li:last-child { border-bottom: none; }
.ss-list li::before {
  counter-increment: ss;
  content: counter(ss);
  position: absolute;
  left: 0;
  top: 0.45rem;
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: var(--primary-soft);
  color: var(--primary-strong);
  font-size: 0.8rem;
  font-weight: 700;
}
.ss-tip { margin: 0.8rem 0 0; color: var(--warning); font-size: 0.9rem; }

/* ---------- 例题卡片 ---------- */
.example-card {
  margin: 1.75rem 0;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-elev);
  padding: 1rem 1.1rem 1.2rem;
  box-shadow: var(--shadow);
}
.ex-head { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
.ex-head h3 { margin: 0; font-size: 1.05rem; flex: 1; }
.diff { font-size: 0.75rem; padding: 0.1rem 0.5rem; border-radius: 999px; border: 1px solid var(--border); }
.diff-easy { color: var(--success); border-color: var(--success); background: var(--success-soft); }
.diff-medium { color: var(--warning); border-color: var(--warning); background: var(--warning-soft); }
.diff-hard { color: var(--danger); border-color: var(--danger); background: var(--danger-soft); }
.ex-source { font-size: 0.75rem; color: var(--text-dim); }

/* ---------- 折叠解析 ---------- */
.reveal { margin: 0.8rem 0 0; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); }
.reveal > summary {
  cursor: pointer;
  padding: 0.55rem 0.9rem;
  font-weight: 600;
  color: var(--primary-strong);
  list-style: none;
}
.reveal > summary::-webkit-details-marker { display: none; }
.reveal > summary::before { content: '▸ '; }
.reveal[open] > summary::before { content: '▾ '; }
.reveal-body { padding: 0.2rem 0.9rem 0.9rem; }

/* ---------- 思维导图 ---------- */
.markmap-wrap { margin: 1.5rem 0; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); overflow: hidden; }
.markmap-toolbar { display: flex; gap: 0.5rem; padding: 0.6rem 0.8rem; border-bottom: 1px solid var(--border); }
.markmap-toolbar button {
  padding: 0.3rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  color: var(--text);
  cursor: pointer;
  font-size: 0.85rem;
}
.markmap-toolbar button:hover { border-color: var(--primary); color: var(--primary-strong); }
.markmap { width: 100%; display: block; color: var(--text); }
.markmap-wrap:fullscreen { border-radius: 0; background: var(--bg); }
.markmap-wrap:fullscreen .markmap { height: calc(100vh - 60px) !important; }

/* ---------- 下一页/上一页 ---------- */
.section-pager { display: flex; justify-content: space-between; gap: 1rem; margin-top: 2.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border); }
.section-pager a { padding: 0.5rem 0.9rem; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); font-size: 0.9rem; }
.section-pager a:hover { border-color: var(--primary); text-decoration: none; }

/* ---------- 搜索 ---------- */
.search-status { color: var(--text-muted); }
.search-status code { font-family: var(--font-mono); background: var(--code-bg); padding: 0.1em 0.4em; border-radius: 4px; }
```

- [ ] **步骤 5：写入 `src/layouts/BaseLayout.astro`**

```astro
---
import Header from '../components/Header.astro';
import 'katex/dist/katex.min.css';
import '../styles/tokens.css';
import '../styles/global.css';
import '../styles/prose.css';
import '../styles/components.css';

interface Props {
  title?: string;
  description?: string;
}
const {
  title = '高中化学要点',
  description = '高中化学知识总结 · 易错点 · 考点 · 解题方法',
} = Astro.props;
---
<!doctype html>
<html lang="zh-CN" data-theme="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title}</title>
    <script is:inline>
      (function () {
        try {
          var t = localStorage.getItem('theme');
          document.documentElement.dataset.theme = t === 'light' ? 'light' : 'dark';
        } catch (e) {}
      })();
    </script>
  </head>
  <body>
    <Header />
    <main class="site-main"><slot /></main>
    <footer class="site-footer">
      <p>高中化学要点总结 · 内容持续更新</p>
    </footer>
  </body>
</html>
```

- [ ] **步骤 6：更新 `src/pages/index.astro` 使用 BaseLayout**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="高中化学要点">
  <section class="hero">
    <h1>高中化学要点总结</h1>
    <p>把易错点讲透，把解题方法讲清楚。</p>
  </section>
</BaseLayout>
```

- [ ] **步骤 7：验证**

运行：`npm run check && npm run build:only`

预期：无错误；`dist/index.html` 中可看到 `data-theme="dark"`。运行 `npm run dev`，浏览器访问首页为暗色背景。

---

## 任务 3：内容集合、知识点元数据与模板

**文件：**
- 创建：`src/content.config.ts`、`src/utils/topics.ts`
- 创建：`templates/knowledge-point/index.mdx`、`mistakes.mdx`、`exam-points.mdx`、`methods.mdx`、`mindmap.mdx`、`examples.mdx`

- [ ] **步骤 1：写入 `src/content.config.ts`**

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const knowledge = defineCollection({
  loader: glob({ base: './src/content', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    topic: z.string(),
    category: z.enum([
      'overview',
      'mistakes',
      'exam-points',
      'methods',
      'mindmap',
      'examples',
    ]),
    order: z.number().default(0),
    summary: z.string().default(''),
    tags: z.array(z.string()).default([]),
    difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
    examFrequency: z.enum(['high', 'medium', 'low']).default('medium'),
    updated: z.string().default(''),
  }),
});

export const collections = { knowledge };
```

- [ ] **步骤 2：写入 `src/utils/topics.ts`**

```ts
export interface SubjectMeta {
  slug: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export interface TopicMeta {
  slug: string;
  subject: string;
  title: string;
  icon: string;
  order: number;
  summary: string;
  tags: string[];
}

export const subjectList: SubjectMeta[] = [
  {
    slug: 'chemistry',
    title: '化学',
    description: '高中化学要点 · 易错点 · 考点 · 解题方法',
    icon: '⚗️',
    order: 1,
  },
];

export const topics: TopicMeta[] = [
  {
    slug: 'avogadro',
    subject: 'chemistry',
    title: '阿伏加德罗常数',
    icon: 'NA',
    order: 1,
    summary: '物质的量计算的核心，高考选择题的高频陷阱区',
    tags: ['物质的量', '气体摩尔体积', '氧化还原'],
  },
];

export const sectionMeta = {
  overview: { label: '概览', icon: '📖' },
  mistakes: { label: '易错点', icon: '⚠️' },
  'exam-points': { label: '考点解析', icon: '🎯' },
  methods: { label: '解题方法', icon: '🧭' },
  mindmap: { label: '思维导图', icon: '🗺️' },
  examples: { label: '典型例题', icon: '📝' },
} as const;

export type SectionKey = keyof typeof sectionMeta;

export const difficultyLabel: Record<string, string> = {
  easy: '基础',
  medium: '中等',
  hard: '较难',
};

export const frequencyLabel: Record<string, string> = {
  high: '高频',
  medium: '中频',
  low: '低频',
};

export function getSubject(slug: string): SubjectMeta | undefined {
  return subjectList.find((s) => s.slug === slug);
}

export function getTopicsBySubject(subject: string): TopicMeta[] {
  return topics.filter((t) => t.subject === subject).sort((a, b) => a.order - b.order);
}

export function getTopic(subject: string, slug: string): TopicMeta | undefined {
  return topics.find((t) => t.subject === subject && t.slug === slug);
}

export function sectionHref(subject: string, topic: string, section: SectionKey): string {
  return section === 'overview' ? `/${subject}/${topic}/` : `/${subject}/${topic}/${section}`;
}
```

- [ ] **步骤 3：写入模板 `templates/knowledge-point/index.mdx`**

```mdx
---
title: "知识点名称 · 概览"
topic: "REPLACE_TOPIC"
category: "overview"
order: 0
summary: "一句话说明这个知识点考什么、难在哪。"
tags: ["标签1", "标签2"]
difficulty: "medium"
examFrequency: "high"
updated: "2026-09-13"
---

## 核心概念

在这里写定义、物理意义、单位。

## 核心公式

$$n = \frac{N}{N_A}$$

## 适用条件

- 条件一
- 条件二

## 学习导航

| 专题 | 内容 |
|------|------|
| 易错点 | 见左栏「易错点」 |
| 考点解析 | 见左栏「考点解析」 |
| 解题方法 | 见左栏「解题方法」 |
```

- [ ] **步骤 4：写入模板 `templates/knowledge-point/mistakes.mdx`**

```mdx
---
title: "知识点名称 · 易错点"
topic: "REPLACE_TOPIC"
category: "mistakes"
order: 1
summary: "逐条拆解高频错误，并给出接题方法。"
tags: ["易错"]
difficulty: "medium"
examFrequency: "high"
updated: "2026-09-13"
---

import MistakeCard from '@/components/MistakeCard.astro';
import Callout from '@/components/Callout.astro';

<MistakeCard index={1} title="易错点标题" frequency="high" tags={['标签']}>
<Callout type="wrong" title="错误示例">

写下典型错误说法。

</Callout>

<Callout type="why" title="错因剖析">

解释为什么错。

</Callout>

<Callout type="right" title="正确做法">

给出正确判断或计算。

</Callout>

<Callout type="skill" title="接题方法">

给出可复用的判断口诀或检查步骤。

</Callout>
</MistakeCard>
```

- [ ] **步骤 5：写入模板 `templates/knowledge-point/exam-points.mdx`**

```mdx
---
title: "知识点名称 · 考点解析"
topic: "REPLACE_TOPIC"
category: "exam-points"
order: 2
summary: "按题型梳理考法与陷阱。"
tags: ["考点"]
difficulty: "medium"
examFrequency: "high"
updated: "2026-09-13"
---

import Callout from '@/components/Callout.astro';

## 题型一：选择题

- **考频**：高频
- **常见陷阱**：
- **关联易错点**：第 1、2 条

<Callout type="tip" title="得分要点">

写要点。

</Callout>
```

- [ ] **步骤 6：写入模板 `templates/knowledge-point/methods.mdx`**

```mdx
---
title: "知识点名称 · 解题方法"
topic: "REPLACE_TOPIC"
category: "methods"
order: 3
summary: "可复用的解题模型与检查清单。"
tags: ["解题方法"]
difficulty: "medium"
examFrequency: "high"
updated: "2026-09-13"
---

import SolutionSteps from '@/components/SolutionSteps.astro';
import Callout from '@/components/Callout.astro';

<SolutionSteps
  model="核心解题模型"
  steps={['第一步', '第二步', '第三步']}
  tip="一句话提醒"
/>
```

- [ ] **步骤 7：写入模板 `templates/knowledge-point/mindmap.mdx`**

```mdx
---
title: "知识点名称 · 思维导图"
topic: "REPLACE_TOPIC"
category: "mindmap"
order: 4
summary: "用思维导图串起全部知识。"
tags: ["思维导图"]
difficulty: "easy"
examFrequency: "medium"
updated: "2026-09-13"
---

# 知识点名称

## 核心概念

### 定义

### 单位

## 核心公式

## 常见陷阱

## 解题方法
```

- [ ] **步骤 8：写入模板 `templates/knowledge-point/examples.mdx`**

```mdx
---
title: "知识点名称 · 典型例题"
topic: "REPLACE_TOPIC"
category: "examples"
order: 5
summary: "典型例题与完整解析。"
tags: ["例题"]
difficulty: "medium"
examFrequency: "high"
updated: "2026-09-13"
---

import ExampleCard from '@/components/ExampleCard.astro';
import Reveal from '@/components/Reveal.astro';
import Callout from '@/components/Callout.astro';

<ExampleCard title="例题一" difficulty="easy">
题干内容。

<Reveal summary="查看解析">

解析内容。

</Reveal>

<Callout type="tip" title="方法复盘">

方法总结。

</Callout>
</ExampleCard>
```

- [ ] **步骤 9：验证**

运行：`npx astro sync && npm run check`

预期：`.astro/types.d.ts` 生成，`knowledge` 集合类型可用，无报错。（此时 `src/content` 尚无正式内容，集合为空也合法。）

---

## 任务 4：基础组件（Header / Breadcrumb / TagBadge / Callout / Sidebar / Toc）

**文件：**
- 创建：`src/components/Header.astro`
- 创建：`src/components/Breadcrumb.astro`
- 创建：`src/components/TagBadge.astro`
- 创建：`src/components/Callout.astro`
- 创建：`src/components/Sidebar.astro`
- 创建：`src/components/Toc.astro`
- 创建：`src/components/KnowledgeCard.astro`

- [ ] **步骤 1：写入 `src/components/Header.astro`**

```astro
---
const pathname = Astro.url.pathname;
const isHome = pathname === '/';
---
<header class="site-header">
  <div class="header-inner">
    <a href="/" class="brand">
      <span class="brand-mark">H₂O</span>
      <span class="brand-text">高中化学要点</span>
    </a>
    <nav class="site-nav" aria-label="主导航">
      <a href="/" class:list={['nav-link', { active: isHome }]}>首页</a>
      <a href="/chemistry/" class:list={['nav-link', { active: pathname.startsWith('/chemistry') }]}>化学</a>
    </nav>
    <div class="header-actions">
      <a href="/search/" class="icon-btn" aria-label="搜索" title="搜索">🔍</a>
      <button id="theme-toggle" class="icon-btn" aria-label="切换主题" title="切换明暗主题">🌙</button>
    </div>
  </div>
</header>
<script>
  const btn = document.getElementById('theme-toggle');
  function render() {
    const t = document.documentElement.dataset.theme;
    if (btn) btn.textContent = t === 'light' ? '☀️' : '🌙';
  }
  render();
  btn?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch (e) {}
    render();
  });
</script>
```

- [ ] **步骤 2：写入 `src/components/Breadcrumb.astro`**

```astro
---
interface Crumb {
  label: string;
  href?: string;
}
interface Props {
  items: Crumb[];
}
const { items } = Astro.props;
---
<nav class="breadcrumb" aria-label="面包屑">
  {
    items.map((item, i) => (
      <>
        {i > 0 && <span class="sep">/</span>}
        {item.href ? <a href={item.href}>{item.label}</a> : <span>{item.label}</span>}
      </>
    ))
  }
</nav>
```

- [ ] **步骤 3：写入 `src/components/TagBadge.astro`**

```astro
---
interface Props {
  label: string;
  href?: string;
  variant?: string;
}
const { label, href, variant = 'tag' } = Astro.props;
const cls = `tag-badge ${variant}`;
---
{href ? <a class={cls} href={href}>{label}</a> : <span class={cls}>{label}</span>}
```

- [ ] **步骤 4：写入 `src/components/Callout.astro`**

```astro
---
type CalloutType =
  | 'wrong'
  | 'why'
  | 'right'
  | 'skill'
  | 'tip'
  | 'note'
  | 'memory'
  | 'formula';

interface Props {
  type?: CalloutType;
  title?: string;
}
const { type = 'note', title } = Astro.props;
const icons: Record<CalloutType, string> = {
  wrong: '❌',
  why: '🔍',
  right: '✅',
  skill: '🎯',
  tip: '💡',
  note: '📌',
  memory: '🧠',
  formula: '🧮',
};
const labels: Record<CalloutType, string> = {
  wrong: '错误示例',
  why: '错因剖析',
  right: '正确做法',
  skill: '接题方法',
  tip: '技巧',
  note: '注意',
  memory: '记忆',
  formula: '公式',
};
---
<div class:list={['callout', `callout-${type}`]}>
  <div class="callout-head">{icons[type]} <span>{title ?? labels[type]}</span></div>
  <div class="callout-body prose"><slot /></div>
</div>
```

- [ ] **步骤 5：写入 `src/components/Sidebar.astro`**

```astro
---
interface NavItem {
  key: string;
  label: string;
  icon: string;
  href: string;
}
interface TopicItem {
  slug: string;
  title: string;
  icon: string;
}
interface Props {
  subject: string;
  topic: string;
  topicList: TopicItem[];
  navSections: NavItem[];
  current: string;
}
const { subject, topic, topicList, navSections, current } = Astro.props;
---
<aside class="sidebar">
  <div class="sidebar-block">
    <p class="sidebar-title">知识点</p>
    <ul class="sidebar-list">
      {
        topicList.map((t) => (
          <li>
            <a href={`/${subject}/${t.slug}/`} class:list={[{ active: t.slug === topic }]}>
              <span>{t.icon}</span>
              <span>{t.title}</span>
            </a>
          </li>
        ))
      }
    </ul>
  </div>
  <div class="sidebar-block">
    <p class="sidebar-title">本页专题</p>
    <ul class="sidebar-list">
      {
        navSections.map((s) => (
          <li>
            <a href={s.href} class:list={[{ active: s.key === current }]}>
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </a>
          </li>
        ))
      }
    </ul>
  </div>
</aside>
```

- [ ] **步骤 6：写入 `src/components/Toc.astro`**

```astro
---
interface Heading {
  depth: number;
  text: string;
  slug: string;
}
interface Props {
  headings: Heading[];
}
const { headings } = Astro.props;
const items = headings.filter((h) => h.depth === 2 || h.depth === 3);
---
{
  items.length > 0 && (
    <aside class="toc">
      <p class="toc-title">本页目录</p>
      <ul>
        {items.map((h) => (
          <li class:list={[`depth-${h.depth}`]}>
            <a href={`#${h.slug}`}>{h.text}</a>
          </li>
        ))}
      </ul>
    </aside>
  )
}
```

- [ ] **步骤 7：写入 `src/components/KnowledgeCard.astro`**

```astro
---
interface Props {
  href: string;
  icon: string;
  title: string;
  summary?: string;
}
const { href, icon, title, summary = '' } = Astro.props;
---
<a class="knowledge-card" href={href}>
  <span class="kc-icon">{icon}</span>
  <h3>{title}</h3>
  {summary && <p>{summary}</p>}
</a>
```

- [ ] **步骤 8：验证**

运行：`npm run check && npm run build:only`

预期：无类型错误，构建成功。

---

## 任务 5：卡片组件（MistakeCard / SolutionSteps / Reveal / ExampleCard）

**文件：**
- 创建：`src/components/MistakeCard.astro`
- 创建：`src/components/SolutionSteps.astro`
- 创建：`src/components/Reveal.astro`
- 创建：`src/components/ExampleCard.astro`

- [ ] **步骤 1：写入 `src/components/MistakeCard.astro`**

```astro
---
interface Props {
  index?: number | string;
  title: string;
  frequency?: 'high' | 'medium' | 'low';
  tags?: string[];
}
const { index, title, frequency = 'medium', tags = [] } = Astro.props;
const freqLabel: Record<string, string> = { high: '高频', medium: '中频', low: '低频' };
---
<section class="mistake-card" id={index ? `mistake-${index}` : undefined}>
  <header class="mistake-head">
    {index !== undefined && <span class="mistake-num">{index}</span>}
    <h3>{title}</h3>
    <span class:list={['freq', `freq-${frequency}`]}>{freqLabel[frequency]}</span>
  </header>
  {
    tags.length > 0 && (
      <div class="mistake-tags">
        {tags.map((t) => (
          <span class="tag">{t}</span>
        ))}
      </div>
    )
  }
  <div class="mistake-body"><slot /></div>
</section>
```

- [ ] **步骤 2：写入 `src/components/SolutionSteps.astro`**

```astro
---
interface Props {
  model: string;
  steps: string[];
  tip?: string;
}
const { model, steps, tip } = Astro.props;
---
<section class="solution-steps">
  <h3 class="ss-title">🧭 {model}</h3>
  <ol class="ss-list">
    {steps.map((s) => <li>{s}</li>)}
  </ol>
  {tip && <p class="ss-tip">💡 {tip}</p>}
</section>
```

- [ ] **步骤 3：写入 `src/components/Reveal.astro`**

```astro
---
interface Props {
  summary?: string;
  open?: boolean;
}
const { summary = '查看解析', open = false } = Astro.props;
---
<details class="reveal" open={open}>
  <summary>{summary}</summary>
  <div class="reveal-body prose"><slot /></div>
</details>
```

- [ ] **步骤 4：写入 `src/components/ExampleCard.astro`**

```astro
---
interface Props {
  title: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  source?: string;
}
const { title, difficulty = 'medium', source } = Astro.props;
const diffLabel: Record<string, string> = { easy: '基础', medium: '中等', hard: '较难' };
---
<article class="example-card">
  <header class="ex-head">
    <h3>{title}</h3>
    <span class:list={['diff', `diff-${difficulty}`]}>{diffLabel[difficulty]}</span>
    {source && <span class="ex-source">{source}</span>}
  </header>
  <div class="ex-body prose"><slot /></div>
</article>
```

- [ ] **步骤 5：验证**

运行：`npm run check`

预期：无类型错误。

---

## 任务 6：思维导图组件 MarkmapView

**文件：**
- 创建：`src/components/MarkmapView.astro`

- [ ] **步骤 1：写入 `src/components/MarkmapView.astro`**

```astro
---
interface Props {
  markdown: string;
  height?: string;
}
const { markdown, height = '640px' } = Astro.props;
---
<div class="markmap-wrap">
  <div class="markmap-toolbar">
    <button type="button" data-mm="fit">适应窗口</button>
    <button type="button" data-mm="full">全屏</button>
  </div>
  <svg class="markmap" style={`height:${height}`} data-markdown={markdown}></svg>
</div>
<script>
  import { Transformer } from 'markmap-lib';
  import { Markmap } from 'markmap-view';

  const transformer = new Transformer();

  function init() {
    document.querySelectorAll<SVGSVGElement>('svg.markmap').forEach((svg) => {
      const md = svg.getAttribute('data-markdown') || '';
      const { root } = transformer.transform(md);
      const mm = Markmap.create(
        svg,
        {
          autoFit: true,
          duration: 300,
          maxWidth: 280,
          spacingVertical: 8,
          spacingHorizontal: 90,
        },
        root,
      );
      (svg as unknown as { __mm: typeof mm }).__mm = mm;

      const wrap = svg.closest('.markmap-wrap');
      wrap?.querySelector('[data-mm="fit"]')?.addEventListener('click', () => mm.fit());
      wrap?.querySelector('[data-mm="full"]')?.addEventListener('click', () => {
        if (document.fullscreenElement) {
          void document.exitFullscreen();
        } else {
          void wrap.requestFullscreen();
        }
      });
    });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
</script>
```

- [ ] **步骤 2：验证构建能打包依赖**

运行：`npm run check && npm run build:only`

预期：无错误；构建日志中 markmap 依赖被打包进客户端脚本。

---

## 任务 7：知识点布局 KnowledgeLayout

**文件：**
- 创建：`src/layouts/KnowledgeLayout.astro`

- [ ] **步骤 1：写入 `src/layouts/KnowledgeLayout.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from './BaseLayout.astro';
import Breadcrumb from '../components/Breadcrumb.astro';
import Sidebar from '../components/Sidebar.astro';
import Toc from '../components/Toc.astro';
import TagBadge from '../components/TagBadge.astro';
import {
  sectionMeta,
  getTopic,
  getSubject,
  getTopicsBySubject,
  sectionHref,
  difficultyLabel,
  frequencyLabel,
  type SectionKey,
} from '../utils/topics';

interface Heading {
  depth: number;
  text: string;
  slug: string;
}

interface Props {
  subject: string;
  topic: string;
  section: SectionKey;
  title: string;
  summary?: string;
  difficulty?: string;
  examFrequency?: string;
  tags?: string[];
  headings?: Heading[];
}

const {
  subject,
  topic,
  section,
  title,
  summary = '',
  difficulty,
  examFrequency,
  tags = [],
  headings = [],
} = Astro.props;

const subjectMeta = getSubject(subject);
const topicMeta = getTopic(subject, topic);
const topicList = getTopicsBySubject(subject).map((t) => ({
  slug: t.slug,
  title: t.title,
  icon: t.icon,
}));

const entries = await getCollection('knowledge', ({ data }) => data.topic === topic);
const available = new Set(entries.map((e) => e.data.category));
const sectionKeys = Object.keys(sectionMeta) as SectionKey[];
const navSections = sectionKeys
  .filter((key) => available.has(key))
  .map((key) => ({
    key,
    label: sectionMeta[key].label,
    icon: sectionMeta[key].icon,
    href: sectionHref(subject, topic, key),
  }));

const crumbs = [
  { label: '首页', href: '/' },
  { label: subjectMeta?.title ?? subject, href: `/${subject}/` },
  { label: topicMeta?.title ?? topic, href: `/${subject}/${topic}/` },
  { label: sectionMeta[section].label },
];

const pagerIndex = navSections.findIndex((s) => s.key === section);
const prevSection = pagerIndex > 0 ? navSections[pagerIndex - 1] : undefined;
const nextSection =
  pagerIndex >= 0 && pagerIndex < navSections.length - 1 ? navSections[pagerIndex + 1] : undefined;

const hasToc = section !== 'mindmap' && headings.length > 0;
---
<BaseLayout title={`${title} · ${topicMeta?.title ?? '高中化学'}`} description={summary}>
  <div class="knowledge-shell">
    <Sidebar {subject} {topic} {topicList} {navSections} current={section} />
    <div class="knowledge-main">
      <Breadcrumb items={crumbs} />
      <article class="knowledge-article">
        <div class="article-head">
          <h1>{title}</h1>
          {summary && <p class="article-summary">{summary}</p>}
          <div class="meta-row">
            {
              difficulty && (
                <TagBadge
                  label={`难度 · ${difficultyLabel[difficulty] ?? difficulty}`}
                  variant={`diff-${difficulty}`}
                />
              )
            }
            {
              examFrequency && (
                <TagBadge
                  label={`考频 · ${frequencyLabel[examFrequency] ?? examFrequency}`}
                  variant={`freq-${examFrequency}`}
                />
              )
            }
            {tags.map((t) => <TagBadge label={t} href={`/tag/${t}/`} variant="tag" />)}
          </div>
        </div>
        <div class="prose"><slot /></div>
        {
          (prevSection || nextSection) && (
            <nav class="section-pager">
              {prevSection ? (
                <a href={prevSection.href}>← {prevSection.label}</a>
              ) : (
                <span />
              )}
              {nextSection ? <a href={nextSection.href}>{nextSection.label} →</a> : <span />}
            </nav>
          )
        }
      </article>
    </div>
    {hasToc && <Toc {headings} />}
  </div>
</BaseLayout>
```

- [ ] **步骤 2：验证**

运行：`npm run check`

预期：无类型错误。

---

## 任务 8：首页

**文件：**
- 创建：`src/pages/index.astro`（覆盖占位）

- [ ] **步骤 1：写入 `src/pages/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import KnowledgeCard from '../components/KnowledgeCard.astro';
import { subjectList, topics } from '../utils/topics';

const overviews = await getCollection('knowledge', ({ data }) => data.category === 'overview');
const totalEntries = await getCollection('knowledge');
---
<BaseLayout title="高中化学要点总结" description="高中化学易错点、考点与解题方法总结">
  <section class="hero">
    <h1>高中化学要点总结</h1>
    <p>把易错点讲透，把解题方法讲清楚。当前收录 {topics.length} 个知识点、{totalEntries.length} 篇专题。</p>
  </section>

  <h2 class="section-title">学科</h2>
  <div class="card-grid">
    {
      subjectList.map((s) => (
        <KnowledgeCard
          href={`/${s.slug}/`}
          icon={s.icon}
          title={s.title}
          summary={s.description}
        />
      ))
    }
  </div>

  <h2 class="section-title">知识点</h2>
  <div class="card-grid">
    {
      topics.map((t) => {
        const ov = overviews.find((e) => e.data.topic === t.slug);
        return (
          <KnowledgeCard
            href={`/${t.subject}/${t.slug}/`}
            icon={t.icon}
            title={t.title}
            summary={ov?.data.summary || t.summary}
          />
        );
      })
    }
  </div>
</BaseLayout>
```

- [ ] **步骤 2：验证**

运行：`npm run build:only`

预期：构建成功。`npm run dev` 访问 `/` 可见学科与知识点卡片。

---

## 任务 9：学科模块页

**文件：**
- 创建：`src/pages/[subject]/index.astro`

- [ ] **步骤 1：写入 `src/pages/[subject]/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Breadcrumb from '../../components/Breadcrumb.astro';
import KnowledgeCard from '../../components/KnowledgeCard.astro';
import { subjectList, getTopicsBySubject } from '../../utils/topics';

export async function getStaticPaths() {
  return subjectList.map((s) => ({
    params: { subject: s.slug },
    props: { subject: s },
  }));
}

const { subject } = Astro.props;
const list = getTopicsBySubject(subject.slug);
const overviews = await getCollection(
  'knowledge',
  ({ data }) => data.category === 'overview',
);
---
<BaseLayout title={`${subject.title} · 高中化学要点`} description={subject.description}>
  <Breadcrumb items={[{ label: '首页', href: '/' }, { label: subject.title }]} />
  <section class="hero" style="padding:1.5rem 0 1rem;text-align:left;">
    <h1>{subject.title}</h1>
    <p>{subject.description}</p>
  </section>
  <div class="card-grid">
    {
      list.map((t) => {
        const ov = overviews.find((e) => e.data.topic === t.slug);
        return (
          <KnowledgeCard
            href={`/${t.subject}/${t.slug}/`}
            icon={t.icon}
            title={t.title}
            summary={ov?.data.summary || t.summary}
          />
        );
      })
    }
  </div>
</BaseLayout>
```

- [ ] **步骤 2：验证**

运行：`npm run build:only`

预期：生成 `dist/chemistry/index.html`。

---

## 任务 10：知识点概览页与通用分节页

**文件：**
- 创建：`src/pages/[subject]/[topic]/index.astro`
- 创建：`src/pages/[subject]/[topic]/[section].astro`

- [ ] **步骤 1：写入 `src/pages/[subject]/[topic]/index.astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import KnowledgeLayout from '../../../layouts/KnowledgeLayout.astro';

export async function getStaticPaths() {
  const entries = await getCollection('knowledge', ({ data }) => data.category === 'overview');
  return entries.map((entry) => {
    const [subject, topic] = entry.id.split('/');
    return { params: { subject, topic }, props: { entry } };
  });
}

const { entry } = Astro.props;
const [subject, topic] = entry.id.split('/');
const { Content, headings } = await render(entry);
---
<KnowledgeLayout
  subject={subject}
  topic={topic}
  section="overview"
  title={entry.data.title}
  summary={entry.data.summary}
  difficulty={entry.data.difficulty}
  examFrequency={entry.data.examFrequency}
  tags={entry.data.tags}
  headings={headings}
>
  <Content />
</KnowledgeLayout>
```

- [ ] **步骤 2：写入 `src/pages/[subject]/[topic]/[section].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import KnowledgeLayout from '../../../layouts/KnowledgeLayout.astro';
import MarkmapView from '../../../components/MarkmapView.astro';
import type { SectionKey } from '../../../utils/topics';

export async function getStaticPaths() {
  const entries = await getCollection('knowledge', ({ data }) => data.category !== 'overview');
  return entries.map((entry) => {
    const [subject, topic] = entry.id.split('/');
    return {
      params: { subject, topic, section: entry.data.category },
      props: { entry },
    };
  });
}

const { entry } = Astro.props;
const [subject, topic] = entry.id.split('/');
const section = entry.data.category as SectionKey;
const { Content, headings } = await render(entry);
---
<KnowledgeLayout
  subject={subject}
  topic={topic}
  section={section}
  title={entry.data.title}
  summary={entry.data.summary}
  difficulty={entry.data.difficulty}
  examFrequency={entry.data.examFrequency}
  tags={entry.data.tags}
  headings={headings}
>
  {section === 'mindmap' ? <MarkmapView markdown={entry.body ?? ''} /> : <Content />}
</KnowledgeLayout>
```

- [ ] **步骤 3：验证**

运行：`npm run check && npm run build:only`

预期：无类型错误。此时 `src/content` 仍为空，路由不生成，但构建成功。

---

## 任务 11：标签聚合页

**文件：**
- 创建：`src/pages/tag/[tag].astro`

- [ ] **步骤 1：写入 `src/pages/tag/[tag].astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Breadcrumb from '../../components/Breadcrumb.astro';
import TagBadge from '../../components/TagBadge.astro';
import { sectionMeta, subjectList, type SectionKey } from '../../utils/topics';

export async function getStaticPaths() {
  const entries = await getCollection('knowledge');
  const tags = new Set<string>();
  for (const e of entries) for (const t of e.data.tags) tags.add(t);
  return [...tags].map((tag) => ({ params: { tag }, props: { tag } }));
}

const { tag } = Astro.props;
const entries = (await getCollection('knowledge')).filter((e) => e.data.tags.includes(tag));
const subjectTitle = (slug: string) => subjectList.find((s) => s.slug === slug)?.title ?? slug;
const sectionLabel = (key: string) =>
  sectionMeta[key as SectionKey]?.label ?? key;
---
<BaseLayout title={`标签：${tag} · 高中化学要点`}>
  <Breadcrumb items={[{ label: '首页', href: '/' }, { label: `标签：${tag}` }]} />
  <section class="hero" style="padding:1.5rem 0 1rem;text-align:left;">
    <h1>标签：{tag}</h1>
    <p>共 {entries.length} 篇相关内容</p>
  </section>
  <ul class="sidebar-list" style="max-width:52rem;">
    {
      entries.map((e) => {
        const [subject, topic] = e.id.split('/');
        const href =
          e.data.category === 'overview'
            ? `/${subject}/${topic}/`
            : `/${subject}/${topic}/${e.data.category}`;
        return (
          <li style="padding:0.4rem 0;border-bottom:1px solid var(--border-soft);">
            <a href={href}>
              {subjectTitle(subject)} · {e.data.title}
              <TagBadge label={sectionLabel(e.data.category)} variant="tag" />
            </a>
          </li>
        );
      })
    }
  </ul>
</BaseLayout>
```

- [ ] **步骤 2：验证**

运行：`npm run check`

预期：无类型错误。

---

## 任务 12：搜索页（Pagefind）

**文件：**
- 创建：`src/pages/search.astro`

> 说明：Pagefind 索引由构建后的 `dist` 生成，因此搜索仅在 `npm run build && npm run preview` 后生效，`npm run dev` 下索引不存在。

- [ ] **步骤 1：写入 `src/pages/search.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Breadcrumb from '../components/Breadcrumb.astro';
---
<BaseLayout title="搜索 · 高中化学要点">
  <Breadcrumb items={[{ label: '首页', href: '/' }, { label: '搜索' }]} />
  <section class="hero" style="padding:1.5rem 0 1rem;text-align:left;">
    <h1>站内搜索</h1>
    <p class="search-status">输入关键词搜索全部知识点与专题。</p>
  </section>
  <div id="search"></div>
  <p class="search-status" id="search-hint" hidden>
    搜索索引未找到。请在构建后预览：<code>npm run build && npm run preview</code>。
  </p>
  <link rel="stylesheet" href="/pagefind/pagefind-ui.css" />
  <script is:inline src="/pagefind/pagefind-ui.js"></script>
  <script>
    function boot() {
      // @ts-expect-error PagefindUI 由外部脚本注入
      if (typeof window.PagefindUI === 'function') {
        // @ts-expect-error 同上
        new window.PagefindUI({ element: '#search', showSubResults: true, translations: { placeholder: '搜索知识点…' } });
      } else {
        const hint = document.getElementById('search-hint');
        if (hint) hint.hidden = false;
      }
    }
    if (document.readyState !== 'loading') boot();
    else document.addEventListener('DOMContentLoaded', boot);
  </script>
</BaseLayout>
```

- [ ] **步骤 2：构建并验证搜索索引**

运行：`npm run build && npm run preview`

预期：构建末尾 Pagefind 输出 `Indexed N pages`；浏览器访问 `/search/`，输入「阿伏加德罗」能返回结果。

---

## 任务 13：内容 · 概览 index.mdx

**文件：**
- 创建：`src/content/chemistry/avogadro/index.mdx`

- [ ] **步骤 1：写入 `src/content/chemistry/avogadro/index.mdx`**

```mdx
---
title: "阿伏加德罗常数 · 概览"
topic: "avogadro"
category: "overview"
order: 0
summary: "1 mol 任何粒子的粒子数，是连接宏观与微观的桥梁，也是高考选择题的高频陷阱区。"
tags: ["物质的量", "气体摩尔体积", "氧化还原"]
difficulty: "medium"
examFrequency: "high"
updated: "2026-09-13"
---

## 一、定义

**阿伏加德罗常数**：1 mol 任何粒子的粒子数，符号 $N_A$。自 2019 年国际单位制（SI）修订后，它是一个精确值：

$$N_A = 6.02214076\times10^{23}\ \text{mol}^{-1}$$

中学计算中通常取近似值 $6.02\times10^{23}\ \text{mol}^{-1}$。

> $N_A$ 是一个**有单位的物理常数**（单位 $\text{mol}^{-1}$），描述的对象是**粒子**（分子、原子、离子、电子等），不是「物质」。

## 二、物理意义

$N_A$ 把宏观可称量的「物质的量」与微观不可数的「粒子数」联系起来：

$$n = \frac{N}{N_A}$$

其中 $n$ 为物质的量（mol），$N$ 为粒子数。

## 三、核心公式组

| 已知量 | 公式 | 备注 |
|--------|------|------|
| 粒子数 $N$ | $n = N / N_A$ | 注意所求粒子主体 |
| 质量 $m$ | $n = m / M$ | $M$ 为摩尔质量，单位 g/mol |
| 气体体积 $V$ | $n = V / V_m$ | 标况下 $V_m = 22.4$ L/mol |
| 溶液浓度 $c$ | $n = cV$ | $V$ 为溶液体积，单位 L |

## 四、适用条件（判断前必查）

1. **22.4 L/mol 的双重前提**：必须同时满足「标准状况（$0\ ^\circ\text{C}$、$101.325$ kPa）」与「气体」。
2. **标准状况下的非气体**：$\ce{H2O}$、$\ce{SO3}$、苯、$\ce{CCl4}$、己烷、乙醇等在标况下为液体或固体。
3. **溶液体积不可直接相加**。
4. **电解质是否完全电离、盐是否水解**。
5. **所求粒子的具体种类**（原子、离子、电子、化学键等）。

## 五、学习导航

- **易错点**：12 条高频陷阱，逐条给出「错误 → 错因 → 正解 → 接题方法」。
- **考点解析**：按选择、计算、实验、推断四类题型拆解。
- **解题方法**：核心转化模型、四问审题法、守恒法与检查清单。
- **思维导图**：一张图串起全部知识。
- **典型例题**：5 道例题，含完整解析与方法复盘。
```

- [ ] **步骤 2：验证**

运行：`npm run check && npm run build:only`

预期：生成 `dist/chemistry/avogadro/index.html`；页面公式渲染正常。

---

## 任务 14：内容 · 易错点 mistakes.mdx（12 条）

**文件：**
- 创建：`src/content/chemistry/avogadro/mistakes.mdx`

- [ ] **步骤 1：写入 `src/content/chemistry/avogadro/mistakes.mdx`**

````mdx
---
title: "阿伏加德罗常数 · 易错点"
topic: "avogadro"
category: "mistakes"
order: 1
summary: "12 条高频易错点，每条都配「错因剖析」与「接题方法」。"
tags: ["易错点", "物质的量", "气体摩尔体积", "氧化还原"]
difficulty: "medium"
examFrequency: "high"
updated: "2026-09-13"
---

import MistakeCard from '@/components/MistakeCard.astro';
import Callout from '@/components/Callout.astro';

下面 12 条按高频程度排列。建议先通读，再用文末的《接题方法总表》自查。

## 1. 粒子主体没有看清

<MistakeCard index={1} title="把「物质」当成「粒子」，忽略所求微粒种类" frequency="high" tags={['微粒种类', '电子数']}>
<Callout type="wrong" title="错误示例">

1 mol $\ce{H2SO4}$ 中含有 $4N_A$ 个原子。（把「氧原子数」当成「原子总数」）

</Callout>

<Callout type="why" title="错因剖析">

$N_A$ 描述的对象是**粒子**，而一种物质可能由多种粒子构成。$\ce{H2SO4}$ 分子共有 $2+1+4=7$ 个原子，其中氧原子为 4 个。题目问「原子」还是「氧原子」，答案不同。

</Callout>

<Callout type="right" title="正确做法">

1 mol $\ce{H2SO4}$ 含 $7N_A$ 个原子、$2N_A$ 个氢原子、$4N_A$ 个氧原子；完全电离后含 $2N_A$ 个 $\ce{H+}$ 和 $N_A$ 个 $\ce{SO4^2-}$。

</Callout>

<Callout type="skill" title="接题方法">

**「划主体」三步法**：① 圈出题目问的粒子（原子？离子？电子？化学键？）；② 拆开化学式数该粒子个数；③ 再乘以物质的量 $n$。

常见易混：羟基 $\ce{-OH}$（9 个电子）与氢氧根 $\ce{OH-}$（10 个电子）；甲基 $\ce{-CH3}$（9 个电子）与甲烷 $\ce{CH4}$（10 个电子）。

</Callout>
</MistakeCard>

## 2. 气体摩尔体积的适用条件

<MistakeCard index={2} title="见到 22.4 L/mol 就直接套用" frequency="high" tags={['气体摩尔体积', '标准状况']}>
<Callout type="wrong" title="错误示例">

常温常压下，22.4 L 氧气含有 $N_A$ 个氧分子。

</Callout>

<Callout type="why" title="错因剖析">

$V_m = 22.4$ L/mol 只适用于**标准状况（$0\ ^\circ\text{C}$、$101.325$ kPa）下的气体**。常温常压（约 $25\ ^\circ\text{C}$）温度更高，气体摩尔体积大于 22.4 L/mol，22.4 L 对应的物质的量小于 1 mol。

</Callout>

<Callout type="right" title="正确做法">

先看条件、再看状态：只有「标准状况 + 气体」两个条件同时满足，才能用 22.4 L/mol。

</Callout>

<Callout type="skill" title="接题方法">

**「标况气体」四字诀**：见到 22.4，立刻问两句——「是标准状况吗？」「是气体吗？」两问缺一不可，任一不满足立即排除该选项。

</Callout>
</MistakeCard>

## 3. 标准状况下的非气体

<MistakeCard index={3} title="把标况下的液体、固体当作气体" frequency="high" tags={['特殊物质', '标准状况']}>
<Callout type="wrong" title="错误示例">

标准状况下，22.4 L $\ce{H2O}$ 含有 $N_A$ 个水分子。

</Callout>

<Callout type="why" title="错因剖析">

标准状况下 $\ce{H2O}$ 是**液态**，不能使用气体摩尔体积 22.4 L/mol。类似的还有 $\ce{SO3}$（标况为固态）、苯、$\ce{CCl4}$、己烷、乙醇等。

</Callout>

<Callout type="right" title="正确做法">

判断 22.4 L 之前先确认物质在标况下的聚集状态。水、$\ce{SO3}$、苯、$\ce{CCl4}$、己烷、乙醇、$\ce{HF}$ 等在标况下均非气体。

</Callout>

<Callout type="skill" title="接题方法">

**记住「标况非气体黑名单」**：水、$\ce{SO3}$、苯、$\ce{CCl4}$、己烷、乙醇。看到这些物质与 22.4 L 同时出现，直接判错。

</Callout>
</MistakeCard>

## 4. 非标准状况滥用 22.4

<MistakeCard index={4} title="非标准状况下使用 22.4 L/mol" frequency="high" tags={['标准状况', '条件陷阱']}>
<Callout type="wrong" title="错误示例">

$25\ ^\circ\text{C}$、$101$ kPa 下，11.2 L $\ce{CO2}$ 含 $0.5N_A$ 个分子。

</Callout>

<Callout type="why" title="错因剖析">

$25\ ^\circ\text{C}$ 不是标准状况（标准状况为 $0\ ^\circ\text{C}$）。用 22.4 L/mol 计算，等于把「常温常压」误当标准状况。

</Callout>

<Callout type="right" title="正确做法">

非标准状况下，气体体积与分子数之间不能直接用 22.4 L/mol 换算，除非给出该条件下的 $V_m$ 或使用理想气体状态方程 $pV=nRT$。

</Callout>

<Callout type="skill" title="接题方法">

**条件扫描法**：读题时先在草稿纸上写下条件三要素——温度、压强、状态。凡不是「$0\ ^\circ\text{C}$、$101.325$ kPa」，就不能用 22.4。

</Callout>
</MistakeCard>

## 5. 溶液体积不可相加

<MistakeCard index={5} title="把两种溶液的体积直接相加" frequency="medium" tags={['溶液', '浓度']}>
<Callout type="wrong" title="错误示例">

将 100 mL 1 mol/L $\ce{NaCl}$ 溶液与 100 mL 1 mol/L $\ce{CaCl2}$ 溶液混合，认为溶液体积为 200 mL。

</Callout>

<Callout type="why" title="错因剖析">

不同溶质、不同浓度的溶液混合，体积一般**不等于**两者体积之和（存在体积收缩或膨胀）。除非题目说明「忽略体积变化」，否则必须使用**最终溶液体积**。

</Callout>

<Callout type="right" title="正确做法">

物质的量可以相加（$n$ 守恒），但体积要用混合后的实际体积。若题目给出混合后体积或密度，必须用它计算浓度。

</Callout>

<Callout type="skill" title="接题方法">

**「n 可加、V 不可加」原则**：涉及浓度时，先把各份溶质的物质的量算出相加，再除以最终体积。看到「混合」二字，先问体积从哪来。

</Callout>
</MistakeCard>

## 6. 弱电解质与盐类水解

<MistakeCard index={6} title="忽略弱电解质部分电离与盐类水解" frequency="high" tags={['电离', '水解', '离子数']}>
<Callout type="wrong" title="错误示例">

1 mol 醋酸溶于水，认为溶液中含 $2N_A$ 个离子（$\ce{H+}$ 与 $\ce{CH3COO-}$ 各 $N_A$）。

</Callout>

<Callout type="why" title="错因剖析">

醋酸是弱电解质，只能**部分电离**，离子数远小于 $2N_A$。同理，易水解的盐（如 $\ce{Na2CO3}$）溶液中 $\ce{CO3^2-}$ 会水解，粒子数发生变化。

</Callout>

<Callout type="right" title="正确做法">

弱电解质部分电离 → 离子数小于理论值；强碱弱酸盐溶液中弱酸根水解 → 该离子数减少、$\ce{OH-}$ 增多。

</Callout>

<Callout type="skill" title="接题方法">

**先分强弱、再看水解**：① 该电解质是强还是弱？弱则「部分电离」；② 是否为易水解的盐？是则「粒子数改变」。含「弱」「水解」「可逆」字样的选项优先怀疑。

</Callout>
</MistakeCard>

## 7. 物质的状态与组成

<MistakeCard index={7} title="忽略稀有气体为单原子分子、水为三原子分子" frequency="high" tags={['分子组成', '稀有气体']}>
<Callout type="wrong" title="错误示例">

1 mol 氦气含有 $2N_A$ 个原子。

</Callout>

<Callout type="why" title="错因剖析">

稀有气体（$\ce{He}$、$\ce{Ne}$、$\ce{Ar}$ 等）是**单原子分子**，1 mol 氦气只含 $N_A$ 个原子。同理，1 mol 水（$\ce{H2O}$）含 $3N_A$ 个原子。

</Callout>

<Callout type="right" title="正确做法">

按化学式数原子：$\ce{He}$ 为 1 个原子/分子，$\ce{O2}$ 为 2 个，$\ce{H2O}$ 为 3 个，$\ce{H2SO4}$ 为 7 个。

</Callout>

<Callout type="skill" title="接题方法">

**「分子类型」速记**：单原子分子（稀有气体）→ 1；双原子分子（$\ce{H2}$、$\ce{O2}$、$\ce{N2}$、$\ce{Cl2}$）→ 2；$\ce{O3}$、$\ce{H2O}$ 特殊记。还要留意同位素（如 $\ce{D2O}$ 摩尔质量为 20 g/mol）。

</Callout>
</MistakeCard>

## 8. 晶体结构中的化学键数

<MistakeCard index={8} title="算错晶体中的共价键数目" frequency="high" tags={['晶体结构', '化学键']}>
<Callout type="wrong" title="错误示例">

1 mol 金刚石中含有 $4N_A$ 个 C–C 键。

</Callout>

<Callout type="why" title="错因剖析">

金刚石中每个碳原子形成 4 个共价键，但**每条键由两个碳原子共享**，所以每个碳原子实际贡献 $4 \div 2 = 2$ 条键。故 1 mol 金刚石含 $2N_A$ 个 C–C 键。

</Callout>

<Callout type="right" title="正确做法">

- 金刚石：1 mol C 含 $2N_A$ 个 C–C 键；
- 石墨：1 mol C 含 $1.5N_A$ 个 C–C 键；
- $\ce{SiO2}$：1 mol 含 $4N_A$ 个 Si–O 键；
- 白磷 $\ce{P4}$：1 mol 含 $6N_A$ 个 P–P 键；
- $\ce{Na2O2}$：1 mol 含 $N_A$ 个 $\ce{O2^2-}$（不是 $2N_A$ 个 $\ce{O^2-}$）。

</Callout>

<Callout type="skill" title="接题方法">

**「键数 = 成键数 ÷ 2」通法**：先数每个结构单元成几条键，再除以该键被几个原子共享。离子晶体还要注意阴离子的真实形式（如 $\ce{O2^2-}$、$\ce{S2^2-}$）。

</Callout>
</MistakeCard>

## 9. 氧化还原反应转移电子数

<MistakeCard index={9} title="电子转移数算错" frequency="high" tags={['氧化还原', '电子转移']}>
<Callout type="wrong" title="错误示例">

$\ce{2Na2O2 + 2H2O -> 4NaOH + O2 ^}$ 中，1 mol $\ce{Na2O2}$ 转移 $2N_A$ 个电子。

</Callout>

<Callout type="why" title="错因剖析">

$\ce{Na2O2}$ 中氧为 $-1$ 价，发生**歧化**：一半升为 $0$ 价（$\ce{O2}$），一半降为 $-2$ 价（$\ce{NaOH}$）。1 mol $\ce{Na2O2}$ 中只有 1 mol 氧发生化合价变化，转移 $1N_A$ 个电子。

</Callout>

<Callout type="right" title="正确做法">

- $\ce{2Na2O2 + 2H2O -> 4NaOH + O2 ^}$：1 mol $\ce{Na2O2}$ 转移 $1N_A$ 个电子；
- $\ce{Cl2 + 2NaOH -> NaCl + NaClO + H2O}$：1 mol $\ce{Cl2}$ 转移 $1N_A$ 个电子；
- $\ce{2Fe + 3Cl2 -> 2FeCl3}$：1 mol $\ce{Fe}$ 转移 $3N_A$ 个电子。

</Callout>

<Callout type="skill" title="接题方法">

**「先配平，再找变价，最后数得失」**：① 标出反应前后变价元素；② 判断是部分氧化、歧化还是归中；③ 数**真正改变**化合价的原子的物质的量，再乘每个原子得失电子数。

</Callout>
</MistakeCard>

## 10. 胶体粒子、聚合物与同位素

<MistakeCard index={10} title="把胶体粒子、高分子链节当成单个分子" frequency="medium" tags={['胶体', '聚合物', '同位素']}>
<Callout type="wrong" title="错误示例">

1 mol $\ce{Fe(OH)3}$ 形成胶体后，胶体粒子数为 $N_A$。

</Callout>

<Callout type="why" title="错因剖析">

胶体粒子是**许多小分子的聚集体**，粒子数远小于 $N_A$。聚合物（如聚乙烯）也需按**链节**计数。

</Callout>

<Callout type="right" title="正确做法">

- 胶体粒子数 $\ll N_A$；
- 1 mol 聚乙烯链节 $\ce{-C2H4-}$ 含 $6N_A$ 个原子（2 个 C + 4 个 H）；
- 同位素：$\ce{D2O}$（$M=20$ g/mol）1 mol 含 $10N_A$ 个中子，$\ce{H2^{18}O}$ 1 mol 也含 $10N_A$ 个中子。

</Callout>

<Callout type="skill" title="接题方法">

**「看聚集、看链节、看同位素」**：遇到分散系先想「是不是胶体」；遇到高分子先想「是否按链节算」；遇到含同位素的物质先想「中子数是多少」。

</Callout>
</MistakeCard>

## 11. 混淆 $N_A$ 与 $6.02\times10^{23}$

<MistakeCard index={11} title="把 $N_A$ 与近似值 $6.02\times10^{23}$ 混为一谈" frequency="medium" tags={['概念辨析']}>
<Callout type="wrong" title="错误示例">

认为「$N_A = 6.02\times10^{23}$」是一个无单位的数值。

</Callout>

<Callout type="why" title="错因剖析">

$N_A$ 是**有单位的物理常数**。自 2019 年 SI 修订后为精确值 $6.02214076\times10^{23}\ \text{mol}^{-1}$；$6.02\times10^{23}\ \text{mol}^{-1}$ 只是中学计算用的近似值。

</Callout>

<Callout type="right" title="正确做法">

表述「$N_A$ 个粒子」与「$6.02\times10^{23}$ 个粒子」在中学计算中可近似等同，但概念上 $N_A$ 带有 $\text{mol}^{-1}$ 单位，指「1 mol 粒子中的粒子数」。

</Callout>

<Callout type="skill" title="接题方法">

**概念题盯住单位**：若选项把 $N_A$ 说成「无单位的常数」或直接把 $N_A$ 等同于 6.02，按概念错误处理。

</Callout>
</MistakeCard>

## 12. 单位换算与有效数字

<MistakeCard index={12} title="单位换算出错、有效数字失控" frequency="medium" tags={['单位换算', '有效数字']}>
<Callout type="wrong" title="错误示例">

把 250 mL 直接代入 $n = cV$，得 $n = 0.1 \times 250 = 25$ mol。

</Callout>

<Callout type="why" title="错因剖析">

浓度单位 mol/L 中体积必须是**升（L）**。$250$ mL $= 0.25$ L，正确结果 $n = 0.1 \times 0.25 = 0.025$ mol。

</Callout>

<Callout type="right" title="正确做法">

先把所有量统一到题目所需单位：$1\ \text{L}=1000\ \text{mL}$，$1\ \text{mol}=1000\ \text{mmol}$；计算后检查单位是否约掉、有效数字是否合理（一般保留 2–3 位）。

</Callout>

<Callout type="skill" title="接题方法">

**「单位先统一，答案后回代」**：动笔前先写下 $n$ 的单位 mol；每一步都检查单位。算完花 5 秒复核量级——$N_A$ 题答案常在 $10^{-3}\sim10^{0}$ mol 量级。

</Callout>
</MistakeCard>

## 接题方法总表

| 看到什么 | 立刻要问 / 要做的 |
|----------|------------------|
| $N_A$ | 所求是哪种粒子（原子 / 离子 / 电子 / 化学键）？ |
| 22.4 L/mol | 是否标准状况？是否气体？ |
| 水、$\ce{SO3}$、苯、$\ce{CCl4}$ | 标况下不是气体，不能用 22.4 |
| 溶液混合 | 体积是否可加？用最终体积算浓度 |
| 弱酸、弱碱、可水解盐 | 是否完全电离？粒子数是否改变？ |
| 稀有气体 | 单原子分子 |
| 金刚石 / 石墨 / $\ce{SiO2}$ | 键数 = 成键数 ÷ 2 |
| 歧化反应（$\ce{Na2O2}$、$\ce{Cl2 + NaOH}$） | 实际变价的原子有多少？ |
| 胶体 / 高分子 / 同位素 | 粒子是否聚集？是否按链节？中子数？ |
| 计算结果 | 单位、量级、有效数字是否正确？ |
````

- [ ] **步骤 2：验证**

运行：`npm run check && npm run build:only`

预期：生成 `dist/chemistry/avogadro/mistakes/index.html`；页面含 12 个 `.mistake-card`，每个含四个 `.callout`（wrong/why/right/skill）。

---

## 任务 15：内容 · 考点解析 exam-points.mdx

**文件：**
- 创建：`src/content/chemistry/avogadro/exam-points.mdx`

- [ ] **步骤 1：写入 `src/content/chemistry/avogadro/exam-points.mdx`**

````mdx
---
title: "阿伏加德罗常数 · 考点解析"
topic: "avogadro"
category: "exam-points"
order: 2
summary: "按选择题、计算题、实验题、推断题四类题型拆解考法与陷阱。"
tags: ["考点", "选择题", "计算题", "实验题"]
difficulty: "medium"
examFrequency: "high"
updated: "2026-09-13"
---

import Callout from '@/components/Callout.astro';

## 题型一：选择题（概念辨析 + 正误判断）

- **考频**：高频（几乎每次考试必考）
- **典型设问**：「设 $N_A$ 为阿伏加德罗常数的值，下列说法正确的是……」
- **核心考法**：把「条件、状态、粒子种类、电解质电离、氧化还原」藏进短句，让考生逐项排查。

<Callout type="tip" title="得分要点">

逐项落实「四查」：一查条件（是否标况）、二查状态（是否气体）、三查粒子（问的是哪种粒子）、四查过程（是否电离 / 水解 / 歧化）。

</Callout>

<Callout type="note" title="关联易错点">

第 1、2、3、4、7、11 条。

</Callout>

## 题型二：计算题（多步转化 + 守恒）

- **考频**：高频
- **典型设问**：由质量、体积、浓度求粒子数；或由粒子数反求质量、体积。
- **核心考法**：多步换算，中途设置「骗分点」（单位、条件、微粒种类）。

<Callout type="formula" title="核心公式链">

$$n = \frac{m}{M} = \frac{V}{V_m} = \frac{N}{N_A} = cV$$

所有计算题的**第一步**都是把已知量换算成物质的量 $n$。

</Callout>

<Callout type="tip" title="得分要点">

善用守恒：质量守恒、电荷守恒、电子守恒、原子守恒。多步计算优先列「关系式」，而不是逐步代入。

</Callout>

<Callout type="note" title="关联易错点">

第 5、6、9、12 条。

</Callout>

## 题型三：实验题（气体体积测定 + 溶液配制 + 滴定）

- **考频**：中频
- **典型设问**：由实验测得的气体体积（或滴定消耗量）计算物质的量、粒子数、产率。
- **核心考法**：把 $N_A$ 藏进实验数据；考查「气体体积是否已换算为标准状况」。

<Callout type="note" title="注意">

量气装置读数需「冷却至室温、调平液面、视线平视」。实验测得的体积往往不是标况体积，需先换算再用 $N_A$。

</Callout>

<Callout type="note" title="关联易错点">

第 2、3、4、12 条。

</Callout>

## 题型四：推断题（同分异构、同系物与 $N_A$ 结合）

- **考频**：中频
- **典型设问**：某有机物结构确定后，判断 1 mol 该物质含某化学键 / 某原子的数目。
- **核心考法**：先推断结构，再按结构计数共价键、原子数、耗氧量等。

<Callout type="tip" title="得分要点">

先定结构式，再逐个原子 / 键计数。注意苯环、双键、三键、羟基、羧基中各类键的数目。

</Callout>

<Callout type="note" title="关联易错点">

第 1、8 条。

</Callout>
````

- [ ] **步骤 2：验证**

运行：`npm run check && npm run build:only`

预期：生成 `dist/chemistry/avogadro/exam-points/index.html`，四个题型标题出现在侧栏与目录中。

---

## 任务 16：内容 · 解题方法 methods.mdx

**文件：**
- 创建：`src/content/chemistry/avogadro/methods.mdx`

- [ ] **步骤 1：写入 `src/content/chemistry/avogadro/methods.mdx`**

````mdx
---
title: "阿伏加德罗常数 · 解题方法"
topic: "avogadro"
category: "methods"
order: 3
summary: "核心转化模型、四问审题法、守恒法与检查清单，可直接套用。"
tags: ["解题方法", "解题模型"]
difficulty: "medium"
examFrequency: "high"
updated: "2026-09-13"
---

import SolutionSteps from '@/components/SolutionSteps.astro';
import Callout from '@/components/Callout.astro';

## 一、核心转化模型

所有 $N_A$ 计算题都围绕一个中心——**先把已知量变成物质的量 $n$**，再由 $n$ 联系目标量。

<SolutionSteps
  model="物质的量核心转化法"
  steps={[
    '审题：圈出物质、数量、状态（固/液/气）、条件（是否标准状况）',
    '转化：把质量、体积、浓度、粒子数统一换算为物质的量 n',
    '关系：用化学式、化学方程式或守恒关系建立 n 之间的联系',
    '求解：回代目标公式，得出粒子数或其他量',
    '复核：检查单位、量级、有效数字与粒子种类',
  ]}
  tip="所有 N_A 题的起点都是 n，所有陷阱都藏在「换算」这一步。"
/>

## 二、四问审题法

拿到「设 $N_A$ 为阿伏加德罗常数的值」这类题，先对每个选项问四个问题：

<SolutionSteps
  model="四问审题法"
  steps={[
    '什么物质？写出化学式，确定组成元素与原子个数',
    '什么状态？固、液还是气？',
    '什么条件？是否标准状况（0 ℃、101.325 kPa）？',
    '求什么粒子？原子、分子、离子、电子还是化学键？',
  ]}
  tip="四问之中只要有一个答案对不上，该选项即可判错。"
/>

## 三、守恒法

多步计算不要逐步代入，优先找守恒关系：

<Callout type="formula" title="四大守恒">

- **质量守恒**：反应前后总质量不变；
- **电荷守恒**：溶液中阳离子电荷总数 = 阴离子电荷总数；
- **电子守恒**：氧化剂得电子总数 = 还原剂失电子总数；
- **原子守恒**：某元素反应前后原子总数不变。

</Callout>

<SolutionSteps
  model="电子守恒法（氧化还原题）"
  steps={[
    '标出反应前后变价元素的化合价',
    '写出各元素化合价的变化值（升 / 降）',
    '根据「得电子总数 = 失电子总数」列等式',
    '由方程式系数确定转移电子数与物质的量的关系',
  ]}
  tip="歧化反应（如 Na₂O₂、Cl₂ + NaOH）要数「真正变价」的原子，不能把全部原子都算上。"
/>

## 四、快速判断口诀

<Callout type="memory" title="口诀速记">

1. **标况气体四字诀**：标况、气体，缺一不可。
2. **标况非气体黑名单**：水、SO₃、苯、CCl₄、己烷、乙醇。
3. **见电子先配平**，找变价、数得失。
4. **晶体键数**：金刚石 2、石墨 1.5、SiO₂ 4、P₄ 6。
5. **遇粒子先划主体**，问啥数啥。
6. **n 可加、V 不可加**（溶液混合）。

</Callout>

## 五、检查清单（交卷前 30 秒）

<SolutionSteps
  model="N_A 题检查清单"
  steps={[
    '单位：体积是否用升？浓度是否 mol/L？质量是否用克？',
    '条件：是否标准状况？',
    '状态：是否气体？是否为标况非气体物质？',
    '粒子：题目问的是哪种粒子？电子数、中子数、化学键数是否算对？',
    '过程：是否完全电离？是否水解？是否歧化？',
    '量级与有效数字：结果是否合理？保留位数是否恰当？',
  ]}
  tip="把这份清单练成条件反射，选择题的错误率会明显下降。"
/>
````

> **注意**：`steps` 是 JSX 表达式（JS 字符串数组），因此数组内**不要**写 `\ce{}`，否则反斜杠会被 JS 转义吞掉。本任务统一使用 Unicode 下标（SO₃、CCl₄、Na₂O₂ 等）。

- [ ] **步骤 2：验证**

运行：`npm run check && npm run build:only`

预期：生成 `dist/chemistry/avogadro/methods/index.html`；页面含 3 个 `.solution-steps` 与 2 个 `.callout`。

---

## 任务 17：内容 · 思维导图 mindmap.mdx

**文件：**
- 创建：`src/content/chemistry/avogadro/mindmap.mdx`

- [ ] **步骤 1：写入 `src/content/chemistry/avogadro/mindmap.mdx`**（纯 Markdown 大纲，不 import 组件）

````mdx
---
title: "阿伏加德罗常数 · 思维导图"
topic: "avogadro"
category: "mindmap"
order: 4
summary: "一张图串起定义、公式、条件、陷阱与解题方法。"
tags: ["思维导图"]
difficulty: "easy"
examFrequency: "medium"
updated: "2026-09-13"
---

# 阿伏加德罗常数

## 核心概念

### 定义
- 1 mol 粒子的粒子数
- 符号 N_A
### 单位
- mol⁻¹
### 数值
- 精确值 6.02214076×10²³
- 近似 6.02×10²³
### 物理意义
- 宏观 n 与微观 N 的桥梁

## 核心公式

### n = N / N_A
### n = m / M
### n = V / V_m
### n = cV

## 适用条件

### 标准状况
#### 0 ℃
#### 101.325 kPa
### 必须为气体
#### 标况非气体黑名单
##### 水
##### SO₃
##### 苯
##### CCl₄
##### 己烷
##### 乙醇

## 常见陷阱

### 粒子主体
#### 原子
#### 离子
#### 电子
#### 化学键
### 溶液体积
#### n 可加
#### V 不可加
### 电解质
#### 弱电解质部分电离
#### 盐类水解
### 晶体结构
#### 金刚石 2
#### 石墨 1.5
#### SiO₂ 4
#### P₄ 6
### 氧化还原
#### 电子守恒
#### 歧化反应
### 特殊物质
#### 稀有气体单原子
#### 胶体粒子聚集
#### 聚合物按链节
#### 同位素中子数

## 解题方法

### 四问审题
#### 什么物质
#### 什么状态
#### 什么条件
#### 什么粒子
### 核心转化
#### 一切先化为 n
### 守恒法
#### 质量
#### 电荷
#### 电子
#### 原子
### 检查清单
#### 单位
#### 条件
#### 状态
#### 粒子
#### 量级
````

- [ ] **步骤 2：验证**

运行：`npm run check && npm run build:only`

预期：生成 `dist/chemistry/avogadro/mindmap/index.html`；`npm run dev` 打开该页，思维导图节点可展开/折叠，暗色下文字可读。

---

## 任务 18：内容 · 典型例题 examples.mdx

**文件：**
- 创建：`src/content/chemistry/avogadro/examples.mdx`

- [ ] **步骤 1：写入 `src/content/chemistry/avogadro/examples.mdx`**

````mdx
---
title: "阿伏加德罗常数 · 典型例题"
topic: "avogadro"
category: "examples"
order: 5
summary: "5 道典型例题，覆盖概念辨析、气体计算、溶液、晶体与氧化还原。"
tags: ["例题", "计算", "氧化还原"]
difficulty: "medium"
examFrequency: "high"
updated: "2026-09-13"
---

import ExampleCard from '@/components/ExampleCard.astro';
import Reveal from '@/components/Reveal.astro';
import Callout from '@/components/Callout.astro';

## 例题一：概念辨析（基础）

<ExampleCard title="判断下列说法是否正确" difficulty="easy">

设 $N_A$ 为阿伏加德罗常数的值，判断：

（1）1 mol 氦气含有 $2N_A$ 个氦原子；

（2）标准状况下 22.4 L $\ce{H2O}$ 含有 $N_A$ 个水分子；

（3）常温常压下 22.4 L $\ce{O2}$ 含有 $N_A$ 个氧分子。

<Reveal summary="查看解析">

（1）**错误**。氦气是单原子分子，1 mol 氦气含 $N_A$ 个原子。

（2）**错误**。标准状况下水是液体，不能用 22.4 L/mol。

（3）**错误**。常温常压不是标准状况，22.4 L 对应的物质的量不是 1 mol。

</Reveal>

<Callout type="tip" title="方法复盘">

概念辨析题的三个高频错误点：单原子分子、标况非气体、非标况滥用 22.4。用「四问审题法」逐句排查。

</Callout>
</ExampleCard>

## 例题二：气体计算

<ExampleCard title="混合气体的分子数" difficulty="easy">

标准状况下，将 11.2 L $\ce{CO2}$ 与 11.2 L $\ce{O2}$ 混合，混合气体的分子总数约为多少？

<Reveal summary="查看解析">

标准状况下，混合气体总体积 $V = 11.2 + 11.2 = 22.4$ L。

$$n = \frac{V}{V_m} = \frac{22.4}{22.4} = 1\ \text{mol}$$

故混合气体分子总数约为 $N_A$ 个（即 $6.02\times10^{23}$ 个）。

两种气体质量不同，但分子数相同——因为同温同压下相同体积的气体含有相同的分子数（阿伏加德罗定律）。

</Reveal>

<Callout type="tip" title="方法复盘">

气体混合时，只要条件相同，**分子数与体积成正比**，与气体种类无关。先求总物质的量，再乘 $N_A$。

</Callout>
</ExampleCard>

## 例题三：溶液中的粒子数

<ExampleCard title="配制溶液并计算离子数" difficulty="easy">

配制 500 mL 0.2 mol/L 的 $\ce{Na2SO4}$ 溶液，需要 $\ce{Na2SO4}$ 的质量是多少？溶液中 $\ce{Na+}$ 的数目是多少？

<Reveal summary="查看解析">

（1）需要 $\ce{Na2SO4}$ 的物质的量：

$$n = cV = 0.2 \times 0.5 = 0.1\ \text{mol}$$

质量：

$$m = nM = 0.1 \times 142 = 14.2\ \text{g}$$

（2）$\ce{Na2SO4 -> 2Na+ + SO4^2-}$，故 $n(\ce{Na+}) = 2 \times 0.1 = 0.2$ mol，离子数约为 $0.2N_A$。

</Reveal>

<Callout type="note" title="关联易错点">

体积必须换成升（500 mL = 0.5 L）；题目问的是 $\ce{Na+}$ 而不是 $\ce{Na2SO4}$。

</Callout>
</ExampleCard>

## 例题四：晶体结构中的化学键

<ExampleCard title="金刚石与 SiO₂ 的共价键数目" difficulty="medium">

（1）12 g 金刚石中含有多少个 C–C 键？

（2）1 mol $\ce{SiO2}$ 中含有多少个 Si–O 键？

<Reveal summary="查看解析">

（1）12 g 金刚石中碳的物质的量 $n = 12 / 12 = 1$ mol。金刚石中每个碳形成 4 条 C–C 键，每条键被 2 个碳共享：

$$n(\text{C–C}) = \frac{4}{2} \times 1 = 2\ \text{mol}$$

即约 $2N_A$ 个 C–C 键。

（2）$\ce{SiO2}$ 中每个硅原子与 4 个氧原子成键，1 mol $\ce{SiO2}$ 含 $4N_A$ 个 Si–O 键。

</Reveal>

<Callout type="tip" title="方法复盘">

「键数 = 成键数 ÷ 2」。金刚石 2、石墨 1.5、SiO₂ 4、P₄ 6，这组数据建议直接记牢。

</Callout>
</ExampleCard>

## 例题五：氧化还原与电子转移

<ExampleCard title="Na₂O₂ 与 CO₂ 反应转移的电子数" difficulty="medium">

反应 $\ce{2Na2O2 + 2CO2 -> 2Na2CO3 + O2 ^}$ 中，若生成 1 mol $\ce{O2}$，转移电子的数目是多少？

<Reveal summary="查看解析">

氧元素在 $\ce{Na2O2}$ 中为 $-1$ 价，反应后：$\ce{Na2CO3}$ 中为 $-2$ 价，$\ce{O2}$ 中为 $0$ 价。

生成 1 mol $\ce{O2}$（2 mol 氧原子由 $-1$ 价升到 $0$ 价），失去电子 $2 \times 1 = 2$ mol；相应有 2 mol 氧原子由 $-1$ 价降到 $-2$ 价，得到 2 mol 电子。

故转移电子数为 $2N_A$。

等价地：1 mol $\ce{Na2O2}$ 转移 $1N_A$ 个电子，生成 1 mol $\ce{O2}$ 需消耗 2 mol $\ce{Na2O2}$，故为 $2N_A$。

</Reveal>

<Callout type="tip" title="方法复盘">

歧化反应先标化合价，数「真正变价」的原子数。用电子守恒验证：得电子总数 = 失电子总数。

</Callout>
</ExampleCard>
````

- [ ] **步骤 2：验证**

运行：`npm run check && npm run build:only`

预期：生成 `dist/chemistry/avogadro/examples/index.html`；页面含 5 个 `.example-card`，解析默认折叠、点击可展开。

---

## 任务 19：全站内容验收

**文件：** 无（仅验证）

- [ ] **步骤 1：类型检查与完整构建**

运行：`npm run check && npm run build`

预期：`astro check` 无错误；`astro build` 生成全部页面；Pagefind 输出 `Indexed N pages`。

- [ ] **步骤 2：确认生成的页面文件**

运行：`ls dist/chemistry/avogadro/`

预期：存在 `index.html`、`mistakes/`、`exam-points/`、`methods/`、`mindmap/`、`examples/` 目录。

- [ ] **步骤 3：本地预览并逐页核对**

运行：`npm run preview`

在浏览器中依次访问并核对：

| 路由 | 核对点 |
|------|--------|
| `/` | 暗色主题；学科与知识点卡片可见 |
| `/chemistry/` | 显示「阿伏加德罗常数」卡片 |
| `/chemistry/avogadro/` | 定义、公式组、适用条件；公式渲染正常 |
| `/chemistry/avogadro/mistakes` | 12 张卡片，每张含 ❌🔍✅🎯 四色块 |
| `/chemistry/avogadro/exam-points` | 四个题型；右侧目录可用 |
| `/chemistry/avogadro/methods` | 解题模型步骤编号正确 |
| `/chemistry/avogadro/mindmap` | 思维导图可缩放、折叠、全屏 |
| `/chemistry/avogadro/examples` | 5 道例题，解析可展开 |
| `/tag/气体摩尔体积/` | 聚合出相关篇章 |
| `/search/` | 搜索「阿伏加德罗」有结果 |

- [ ] **步骤 4：响应式与主题核对**

将浏览器宽度缩到 375px：侧栏隐藏、内容单列、无横向滚动。点击右上角主题按钮：在暗色与亮色间切换，刷新后保持选择。

---

## 任务 20：Vercel 部署配置与收尾

**文件：**
- 创建：`vercel.json`
- 创建：`.gitignore`
- 创建：`public/favicon.svg`

- [ ] **步骤 1：写入 `vercel.json`**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "astro",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

- [ ] **步骤 2：写入 `.gitignore`**

```gitignore
node_modules/
dist/
.astro/
.vercel/
*.log
.DS_Store
```

- [ ] **步骤 3：写入 `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#1a2029"/>
  <text x="32" y="42" font-family="system-ui, sans-serif" font-size="24" font-weight="700" text-anchor="middle" fill="#4a9eff">H₂O</text>
</svg>
```

- [ ] **步骤 4：最终验证**

运行：`npm run check && npm run build`

预期：构建成功，`dist/` 含全部页面与 `pagefind/` 索引。将仓库推送到 GitHub 后在 Vercel 导入，框架自动识别为 Astro，构建产物目录 `dist`，部署成功即可通过公网访问。

- [ ] **步骤 5：Commit（若已启用 Git）**

```bash
git init
git add .
git commit -m "feat: 高中化学要点站点 + 阿伏加德罗常数专题"
```

> 用户当前未要求使用 Git；仅在用户确认后执行此步。

---

## 计划自检

**1. 规格覆盖度**

| 规格章节 | 对应任务 |
|----------|----------|
| 技术栈选型 | 任务 1 |
| 目录结构（组件/布局/页面/utils） | 任务 2–11 |
| 内容模型 Frontmatter | 任务 3 |
| 页面与信息架构（8 条路由） | 任务 8–12 |
| 核心组件（MistakeCard/SolutionSteps/MarkmapView/Callout/ExampleCard） | 任务 4–6 |
| 样式与主题（默认暗色、响应式、无障碍） | 任务 2、19 |
| 阿伏加德罗常数 6 个内容文件 | 任务 13–18 |
| 可扩展性（模板 + topics.ts + 动态路由） | 任务 3、9、10 |
| 验收标准 | 任务 19 |

**2. 占位符扫描**：无「待定 / TODO / 后续实现」。任务 20 首版曾留占位，已在本步补全。

**3. 类型一致性核查**

- `SectionKey` 在 `topics.ts` 定义，`KnowledgeLayout`、`[section].astro`、`tag/[tag].astro` 均引用同一类型。
- `getCollection('knowledge', ...)` 的集合名与 `content.config.ts` 导出的 `knowledge` 一致。
- `sectionMeta` 的六个键 `overview / mistakes / exam-points / methods / mindmap / examples` 与 `content.config.ts` 的 `category` 枚举、六个内容文件的 `category` 完全一致。
- `MistakeCard` 的 `frequency` 取值 `high/medium/low`、`ExampleCard` 的 `difficulty` 取值 `easy/medium/hard` 与 schema 枚举一致。
- `MarkmapView` 接收 `entry.body ?? ''`（`body` 为原始 Markdown 字符串），仅用于 `mindmap` 分节。

**4. 已知注意事项**

- MDX 中自定义组件必须显式 `import`（`components` prop 只能覆盖 HTML 元素）。
- JSX 字符串数组（`SolutionSteps` 的 `steps`、`tip`）中不可使用 `\ce{}`，改用 Unicode 下标。
- `templates/` 位于 `src/content` 之外，避免被 glob loader 采集。
- Pagefind 搜索仅在 `npm run build` 后生效。
