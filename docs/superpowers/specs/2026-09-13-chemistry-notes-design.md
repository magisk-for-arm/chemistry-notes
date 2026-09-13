# 高中化学知识总结网站 — 设计文档

- **日期**：2026-09-13
- **状态**：待用户审查
- **主题**：可扩展的高中化学要点总结网页（首个知识点：阿伏加德罗常数）

---

## 1. 项目目标

为**高中生复习备考**提供一个条理清晰、层次分明的化学知识总结网站。首期聚焦「阿伏加德罗常数」的**易错点**、**考点**与**解题方法**，并保证后续可以低成本扩展更多知识点和学科。

### 成功标准

1. 打开网站能立刻定位到某个知识点的易错点、考点、思维导图、例题。
2. 易错点**不只是罗列错误**，每条都配有「为什么会错」「正确做法」「接题方法（解题模型）」。
3. 新增一个知识点只需在内容目录新建文件夹并放入 MDX 文件，无需改动页面代码。
4. 默认暗色主题，阅读舒适，公式与化学方程式正确渲染。
5. 本地可预览（`npm run dev`），后续可直接部署到 Vercel。

---

## 2. 需求确认

| 维度 | 决定 |
|------|------|
| 目标用户 | 高中生复习备考 |
| 技术栈 | Astro（内容为中心、MDX 原生、零 JS 默认、性能优） |
| 内容管理 | MDX 文件夹结构（每个知识点一个文件夹，按类别拆分文件） |
| 思维导图 | Markmap（Markdown 转思维导图，支持缩放/折叠/全屏） |
| 主题 | **默认暗色**，可切换亮色 |
| 部署 | 目标 Vercel，当前本地预览 |
| 内容要求 | 有条理、易错点清晰、**必须包含接题方法** |

---

## 3. 技术选型理由

- **Astro**：以内容为核心，MDX 支持最好，默认输出静态 HTML，JS 体积小；需要交互（Markmap、搜索、主题切换）时才加载局部脚本。
- **MDX**：既能用 Markdown 快速写知识内容，又能在正文中嵌入 `.astro` 组件（如提示框、公式卡片、例题折叠面板）。
- **Markmap**：直接用 Markdown 大纲生成可交互思维导图，写作成本低，和 MDX 内容天然契合。
- **KaTeX + mhchem**：化学公式（如 `\ce{2H2 + O2 -> 2H2O}`）与数学公式渲染快、体积小。
- **Pagefind**：零配置的静态站客户端搜索，构建后自动生成索引，无需后端。

---

## 4. 目录结构

> **实现细化（以 `docs/superpowers/plans/2026-09-13-chemistry-notes.md` 为准）：**
> 1. 采用**单一 `knowledge` 内容集合**、`base: './src/content'`，entry id 形如 `chemistry/avogadro/mistakes`；「新增学科」只需新建目录，无需改 `content.config.ts`。
> 2. 页面路由收敛为**通用动态路由** `[subject]/index.astro`、`[subject]/[topic]/index.astro`、`[subject]/[topic]/[section].astro`，不再为每个分节单独建文件。
> 3. 新建知识点的模板放在 **`templates/knowledge-point/`**（`src/content` 之外），避免被 `glob` loader 当作正式内容采集。
> 4. 新增 `Reveal.astro`（折叠解析）、`Search` 页；样式集中在 `tokens/global/prose/components` 四个全局 CSS 文件。

```
chemistry-notes/
├── src/
│   ├── components/
│   │   ├── Header.astro            # 顶部导航 + 主题切换 + 搜索入口
│   │   ├── Sidebar.astro           # 知识点侧边导航
│   │   ├── Breadcrumb.astro        # 面包屑
│   │   ├── KnowledgeCard.astro     # 知识点卡片（首页/列表用）
│   │   ├── TagBadge.astro          # 标签徽章（易错点/考点/难度/考频）
│   │   ├── Callout.astro           # 提示框（易错/提示/注意/技巧）
│   │   ├── MistakeCard.astro       # 易错点卡片：错误现象→错因→正解→接题方法
│   │   ├── SolutionSteps.astro     # 解题步骤/模型展示
│   │   ├── ExampleCard.astro       # 例题卡片（题干/解析/点评，可折叠）
│   │   ├── MarkmapView.astro       # Markmap 思维导图组件
│   │   ├── Toc.astro               # 右侧目录（当前页）
│   │   └── ThemeToggle.astro       # 暗色/亮色切换按钮
│   ├── layouts/
│   │   ├── BaseLayout.astro        # 站点基础布局（head、主题、全局样式）
│   │   └── KnowledgeLayout.astro   # 知识点详情页布局（侧栏 + 正文 + 目录）
│   ├── pages/
│   │   ├── index.astro             # 首页：学科入口 + 知识点网格 + 高频考点
│   │   ├── chemistry/
│   │   │   ├── index.astro         # 化学模块首页：知识点列表
│   │   │   └── [topic]/
│   │   │       ├── index.astro     # 知识点概览（定义/公式/适用条件/导图预览）
│   │   │       ├── mistakes.astro  # 易错点 + 接题方法
│   │   │       ├── exam-points.astro # 考点解析（按题型）
│   │   │       ├── methods.astro   # 解题方法/模型专题
│   │   │       ├── mindmap.astro   # 思维导图（全屏 Markmap）
│   │   │       └── examples.astro  # 典型例题
│   │   └── tag/[tag].astro         # 标签聚合页
│   ├── content/
│   │   └── chemistry/
│   │       ├── _template/          # 新建知识点时复制的模板
│   │       │   ├── index.mdx
│   │       │   ├── mistakes.mdx
│   │       │   ├── exam-points.mdx
│   │       │   ├── methods.mdx
│   │       │   ├── mindmap.mdx
│   │       │   └── examples.mdx
│   │       └── avogadro/
│   │           ├── index.mdx
│   │           ├── mistakes.mdx
│   │           ├── exam-points.mdx
│   │           ├── methods.mdx
│   │           ├── mindmap.mdx
│   │           └── examples.mdx
│   ├── styles/
│   │   ├── tokens.css              # 设计变量（颜色/间距/字体/暗色主题）
│   │   ├── global.css              # 全局重置与基础样式
│   │   └── prose.css               # 正文排版（标题/列表/代码/表格/公式）
│   └── utils/
│       ├── content.ts              # 内容集合查询封装
│       ├── topics.ts               # 知识点元数据（顺序、图标、简介）
│       └── search.ts               # 搜索入口封装（Pagefind）
├── public/                        # 静态资源（favicon、图片）
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

### 扩展方式（关键）

新增知识点「物质的量浓度」时：
1. 复制 `src/content/chemistry/_template/` 为 `src/content/chemistry/concentration/`；
2. 填写各 MDX 文件；
3. 在 `src/utils/topics.ts` 注册一条元数据（标题、顺序、图标、简介）。

页面路由由 `[topic]` 动态生成，无需新增页面文件。新增学科同理：新建 `src/content/<subject>/` 并在 `topics.ts` 登记即可复用整套布局。

---

## 5. 内容模型（Frontmatter 规范）

每个 `.mdx` 统一使用以下 Frontmatter：

```yaml
---
title: "阿伏加德罗常数 · 易错点"
topic: "avogadro"          # 知识点标识，与文件夹名一致
category: "mistakes"       # overview | mistakes | exam-points | methods | mindmap | examples
order: 2                   # 同类别排序（通常与 category 对应）
summary: "一句话概述，用于卡片和搜索结果"
tags:                      # 标签，用于聚合与筛选
  - "物质的量"
  - "气体摩尔体积"
difficulty: "medium"       # easy | medium | hard
examFrequency: "high"      # high | medium | low
updated: "2026-09-13"
---
```

`topics.ts` 中登记知识点级元数据：

```ts
export const topics = {
  avogadro: {
    title: "阿伏加德罗常数",
    subject: "chemistry",
    icon: "NA",
    order: 1,
    summary: "物质的量计算的核心，高考选择题高频陷阱区",
    tags: ["物质的量", "气体摩尔体积", "氧化还原"],
  },
} as const;
```

---

## 6. 页面与信息架构

| 路由 | 页面 | 核心内容 |
|------|------|----------|
| `/` | 首页 | 学科入口、知识点网格、高频考点快捷入口 |
| `/chemistry/` | 化学模块 | 全部知识点列表（按顺序/标签） |
| `/chemistry/avogadro/` | 知识点概览 | 定义、数值、物理意义、核心公式、适用条件、导图缩略图 |
| `/chemistry/avogadro/mistakes` | **易错点** | 每条：错误现象 → 错因剖析 → 正确做法 → **接题方法** |
| `/chemistry/avogadro/exam-points` | 考点解析 | 按题型：选择/计算/实验/推断，标注考频与易错关联 |
| `/chemistry/avogadro/methods` | **解题方法** | 解题模型、通用步骤、模板句式、快速判断口诀 |
| `/chemistry/avogadro/mindmap` | 思维导图 | 全屏 Markmap，可缩放、折叠、导出 |
| `/chemistry/avogadro/examples` | 典型例题 | 分类例题、完整解析、易错提示、方法复盘 |
| `/tag/[tag]` | 标签聚合 | 同一标签下的所有内容块 |

页面顶部统一提供：面包屑、知识点切换、当前页目录（TOC）、上一节/下一节。

---

## 7. 核心组件设计

### 7.1 MistakeCard —— 易错点卡片（本项目的灵魂）

固定四段结构，保证「清晰」且「带接题方法」。实现采用「容器 + 内部组合 `Callout`」的方式（全部只用默认插槽，规避 MDX 命名插槽的兼容风险）：

```mdx
import MistakeCard from '@/components/MistakeCard.astro';
import Callout from '@/components/Callout.astro';

<MistakeCard index={1} title="忽略气体摩尔体积的适用条件" frequency="high" tags={['气体摩尔体积', '标准状况']}>
<Callout type="wrong" title="错误示例">常温常压下 22.4 L 任何气体都是 1 mol。</Callout>
<Callout type="why" title="错因剖析">22.4 L/mol 只在标准状况（0 ℃、101 kPa）成立……</Callout>
<Callout type="right" title="正确做法">先判断是否处于标准状况，再判断是否气体……</Callout>
<Callout type="skill" title="接题方法">看到 22.4 → 立刻问“标准状况？气体？”——两问缺一不可。</Callout>
</MistakeCard>
```

四种 Callout 分别渲染为「❌ 错误示例 / 🔍 错因剖析 / ✅ 正确做法 / 🎯 接题方法」，颜色分区，便于扫读。

### 7.2 SolutionSteps —— 解题模型

用于 `methods.mdx` 和例题解析，展示分步解题流程：

```astro
<SolutionSteps
  model="物质的量核心转化法"
  steps={[
    "审题：圈出物质、数量、状态（固/液/气）、条件（标况？）",
    "转化：质量/体积/粒子数 → 物质的量 n",
    "关系：用化学式、方程式、守恒关系建立 n 的联系",
    "求解：回代公式，检查单位与有效数字",
  ]}
  tip="所有计算题的第一步都是“把已知量换算成 n”。"
/>
```

### 7.3 MarkmapView —— 思维导图

- 接收 Markdown 文本（来自 `mindmap.mdx` 的正文），在客户端用 `markmap-view` 渲染。
- 功能：自适应缩放、节点折叠/展开、全屏、切换主题、导出 SVG/PNG。
- 仅在进入导图页时加载脚本（`client:visible` 或页面级 script），不影响其他页面性能。

### 7.4 Callout —— 提示框

类型：`wrong`（错误示例）、`why`（错因剖析）、`right`（正确做法）、`skill`（接题方法）、`tip`（技巧）、`note`（注意）、`memory`（记忆口诀）、`formula`（公式）。前四类构成易错点卡片的四段式结构，其余用于正文中的强调与记忆点。仅使用默认插槽。

### 7.5 ExampleCard —— 例题卡片

题干、解析（由 `Reveal` 组件折叠）、方法复盘（`Callout`）、关联易错点链接。支持难度与来源标注。同样仅使用默认插槽：题干直接作为子内容，解析用 `<Reveal>` 包裹，复盘用 `<Callout>` 包裹。

---

## 8. 样式与主题

### 8.1 设计变量（tokens.css）

- **默认暗色**：背景 `#0f1419`，表面 `#1a2029`，正文 `#e6e6e6`，次要文本 `#9aa7b4`。
- **强调色**：化学蓝 `#4a9eff`（链接/主题色），易错红 `#ff6b6b`，正确绿 `#4ade80`，技巧黄 `#fbbf24`。
- **亮色主题**：通过 `[data-theme="light"]` 覆盖同名变量。
- 主题切换：`ThemeToggle` 写入 `localStorage`，首次访问跟随 `prefers-color-scheme`，但站点默认呈现暗色。

### 8.2 排版（prose.css）

- 中文正文行高 1.8，段间距充足，标题层级明确。
- 公式用 KaTeX，化学方程式用 mhchem（如 `\ce{}`）。
- 表格、引用、代码块针对暗色优化。
- 阅读宽度限制（约 72ch），避免长行疲劳。

### 8.3 响应式

- 桌面：左固定侧栏 + 中间正文 + 右侧目录（三栏）。
- 平板：收起右侧目录为浮动按钮。
- 移动：侧栏改为抽屉，顶部汉堡菜单，内容单列。

### 8.4 无障碍

- 语义化标签、合理对比度、键盘可操作、`prefers-reduced-motion` 支持。

---

## 9. 阿伏加德罗常数内容规划（首批）

### index.mdx（概览）
- 定义：1 mol 任何粒子的粒子数，符号 `N_A`，约 `6.02×10²³ mol⁻¹`。
- 物理意义：宏观物质的量与微观粒子数的桥梁。
- 核心公式组：`n = N/N_A`、`n = m/M`、`n = V/V_m`、`n = cV`。
- 适用条件与新旧标准说明。
- 思维导图预览 + 各专题入口。

### mistakes.mdx（易错点 + 接题方法）—— 规划 12 条
1. `N_A` 的**主体**是「粒子数」而非「物质」——注意所指微粒（原子/分子/离子/电子/质子/中子）。
2. 气体摩尔体积 `22.4 L/mol` 的**双重前提**：标准状况 + 气体。
3. 标准状况下**非气体**物质（H₂O、SO₃、苯、CCl₄、己烷等）不能用 22.4。
4. 非标准状况（常温常压、25 ℃）滥用 22.4。
5. 溶液体积**不可直接相加**，需按最终体积算浓度。
6. 电解质在溶液中**电离出粒子数**（弱电解质部分电离、盐类水解）。
7. 物质**状态与组成**：如「1 mol 冰/水/水蒸气」、稀有气体为单原子分子。
8. **晶体结构**中的化学键数、空隙数目（金刚石、石墨、SiO₂、干冰）。
9. **氧化还原**中转移电子数（注意歧化、部分氧化、变价元素）。
10. 胶体粒子、聚合物（如聚乙烯单元数）、同位素原子数。
11. `N_A` 与 **6.02×10²³** 的关系：`N_A` 是精确常数，6.02×10²³ 是近似值。
12. 有效数字与单位换算链条（L↔mL、g↔kg、mol↔mmol）。

每条统一格式：错误现象 → 错因 → 正解 → **接题方法（判断口诀/检查清单）**。

### exam-points.mdx（考点解析）
- 选择题：概念辨析、正误判断、估算比较。
- 计算题：多步转化、守恒法（质量/电荷/电子）、差量法。
- 实验题：气体体积测定、滴定、溶液配制中的 `N_A` 应用。
- 推断题：同分异构、同系物与 `N_A` 结合。
- 每类标注：考频、典型陷阱、对应易错点编号。

### methods.mdx（解题方法专题）
- **核心转化模型**：质量/体积/浓度/粒子数 ⇄ `n` ⇄ 目标量。
- **四问审题法**：什么物质？什么状态？什么条件？求什么粒子？
- **守恒法**：质量守恒、电荷守恒、电子守恒、原子守恒。
- **快速判断口诀**：如「标况气体四字诀」「见电子先配平」。
- **检查清单**：单位、有效数字、是否标况、微粒种类。
- 每套方法配「适用题型 + 步骤 + 示例 + 常见陷阱」。

### mindmap.mdx（思维导图）
Markdown 大纲结构：
```
# 阿伏加德罗常数
## 核心概念
### 定义 / 单位 / 数值
### 物理意义
## 核心公式
### n = N/N_A
### n = m/M
### n = V/V_m
### n = cV
## 适用条件
### 标准状况
### 气体
## 常见陷阱
### 微粒主体
### 状态条件
### 特殊物质
### 电子转移
## 解题方法
### 四问审题
### 守恒法
### 检查清单
```

### examples.mdx（典型例题）—— 规划 5 道
基础计算、气体混合、溶液稀释、晶体结构、氧化还原电子转移；每题配完整解析、易错提示、方法复盘。

---

## 10. 可扩展性设计

| 扩展方向 | 实现方式 |
|----------|----------|
| 新增知识点 | 复制 `_template` 文件夹 + 在 `topics.ts` 登记，路由自动生成 |
| 新增学科 | 新建 `src/content/<subject>/`，复用布局与组件 |
| 标签筛选/聚合 | Frontmatter `tags` → `/tag/[tag]` 聚合页 |
| 搜索 | Pagefind 构建后索引全站内容 |
| 刷题模式 | 例题组件增加交互属性，记录作答与对错 |
| 学习进度 | LocalStorage 记录已读知识点，侧栏显示进度 |
| 收藏与错题本 | LocalStorage 保存错题，生成个人错题页 |
| PDF/打印 | 打印友好样式，或用 Puppeteer 生成复习手册 |

以上进阶功能不在首期范围，仅确保架构不阻碍后续实现（YAGNI）。

---

## 11. 实现范围（首期）

**包含：**
- Astro 项目脚手架、暗色主题系统、响应式布局。
- 首页、化学模块页、知识点动态路由（概览/易错点/考点/方法/导图/例题）、标签聚合页。
- 核心组件：Header、Sidebar、Breadcrumb、MistakeCard、SolutionSteps、Callout、ExampleCard、MarkmapView、Toc、ThemeToggle、TagBadge、KnowledgeCard。
- 阿伏加德罗常数全部 6 个 MDX 内容文件。
- KaTeX + mhchem、Markmap、Pagefind 搜索。

**不包含（后续迭代）：**
- 用户系统、数据库、刷题记录、错题本、PDF 导出。

---

## 12. 验收标准

1. `npm run dev` 本地可访问，默认暗色主题，可切换到亮色。
2. 首页 → 化学 → 阿伏加德罗常数 → 易错点/考点/方法/导图/例题，导航顺畅。
3. 易错点每条都展示「错误现象/错因/正解/接题方法」四段。
4. 方法专题页包含可复用的解题模型与步骤。
5. 思维导图可缩放、折叠、全屏，暗色下可读。
6. 化学与数学公式正确渲染。
7. 复制 `_template` 并登记 `topics.ts` 后，新知识点无需改页面代码即可访问。
8. 移动端布局正常（侧栏抽屉、单列阅读）。
9. `npm run build` 成功，可部署到 Vercel。
