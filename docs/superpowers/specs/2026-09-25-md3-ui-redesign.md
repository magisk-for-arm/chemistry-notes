# MD3 UI 改造设计与验收基线

日期：2026-09-25
状态：阶段 0 完成，图标选型表已确认（2026-09-25 全票通过，无异议项）

## 一、已锁定的 12 条决策

| # | 议题 | 决策 |
|---|------|------|
| 1 | MD3 深度 | 规范级：重建 token（色板/形状/海拔/UI 字阶），15 个组件对齐形态；不做 ripple、FAB、Drawer、JS 动效 |
| 2 | 色板 seed | 保留 `#4a9eff` 生成 tonal 系列与 state layer |
| 3 | 正文排版 | 只动 UI 层，`prose.css`、74ch 正文、KaTeX 行距不碰 |
| 4 | 布局/路由 | 三栏结构与 22 页路由不变；允许重构导航组件 DOM |
| 5 | emoji 规则 | 控件与语义图标全换；21 个学科图标逐个审 |
| 6 | 图标实现 | 手写 inline SVG，封装 `Icon.astro`，零外部依赖 |
| 7 | 图标风格 | Outlined 线性：24×24 网格、stroke 1.75–2、圆角端点、`currentColor` 随主题 |
| 8 | 图标流程 | 先出选型表确认，再动手画 |
| 9 | 痛点范围 | 间距一致性 + 卡片 Callout + 顶栏侧栏 + 首页信息密度，四项全做 |
| 10 | 验收 | 对比式：基线截图 → 改造 → 同角度对比 |
| 11 | 检查点 | 三阶段逐个停，每阶段 `npm run check` 0 errors + 截图过目 |
| 12 | 落库 | 三阶段三次提交，Conventional Commits 中文 |

## 二、改造前基线

### 截图

16 张，位于 `.openchamber/screenshots/before-*.jpg`（8 页 × 暗/亮）：

| 页面 | 地址 | 暗色 | 亮色 |
|------|------|------|------|
| 首页 | `/` | ✅ | ✅ |
| 学科页 | `/chemistry` | ✅ | ✅ |
| 概览 | `/chemistry/atom-structure` | ✅ | ✅ |
| 易错点 | `/chemistry/atom-structure/mistakes` | ✅ | ✅ |
| 典型例题 | `/chemistry/atom-structure/examples` | ✅ | ✅ |
| 搜索 | `/search` | ✅ | ✅ |
| 标签 | `/tag/有机化学` | ✅ | ✅ |
| 思维导图 | `/chemistry/atom-structure/mindmap` | ✅ | ✅ |

截图说明：暗色批次 03:33 时间戳，亮色批次 03:34 时间戳；每张 MD5 唯一。
`/search` 基线显示「搜索索引未找到」属预期（dist 无 Pagefind 索引），非缺陷。

### 改造前问题清单（对照用）

**P1 首页信息密度**
- 「学科」区只有 1 张卡片（化学），占左侧 1/5 宽度，右侧整片空白，垂直方向拉出大片留白。
- 首页 hero 区与卡片区之间的节奏断层，两个区块之间空档过大。

**P2 emoji 图标质量**
- 21 个学科图标在卡片上的实际渲染依赖系统 emoji 字体，暗色下彩色 emoji 与单色线性 UI 严重冲突（⚡💧🧂 等高饱和色块）。
- `🟢`（氯及其化合物）是纯色圆点，`🥫`（铝）、🧲（铁）、🧶（高分子）与内容语义无关。
- `⚗️` 同时用于学科卡和「化学实验基础」，`🧩` 同时用于「物质的组成与分类」和「有机反应类型」，存在重复。
- `avogadro` 用的是文本 `NA` 而非图标，21 项里已有 1 项不一致。
- 顶栏 ☰🔍🌙、Callout ❌🔍✅🎯💡📌🧠🧮、SolutionSteps 🧭💡 同样是彩色 emoji。

**P3 卡片与 Callout**
- Callout 头部 emoji 与文字基线不齐，图标尺寸随字体浮动。
- 卡片圆角（12px）与内部图标底板圆角（8px）缺乏统一阶梯。

**P4 顶栏与侧栏导航**
- 顶栏图标按钮内的 emoji 使按钮实际尺寸不一，`title` 提示与 emoji 视觉重复。
- 侧栏选中态目前是纯文字高亮，缺少 MD3 的 state layer 与指示器。
- 侧栏 emoji 图标（尤其 🔴🟠 系彩色点）在暗色下比文字更抢眼，喧宾夺主。

**P5 间距与一致性**
- 首页 hero、区块标题、卡片网格之间的间距未成体系。
- 暗色 `--shadow` 与边框叠加使用，卡片层次感弱。

## 三、图标选型表（待确认）

风格契约：Outlined 线性，24×24 网格，stroke 1.75，圆角端点与连接，`currentColor`。

### 3.1 控件图标（4 个）

| 位置 | 现状 | 新图标 | 说明 |
|------|------|--------|------|
| 顶栏菜单 | `☰` | `menu` | 三横线 |
| 顶栏搜索 | `🔍` | `search` | 放大镜 |
| 顶栏主题 | `🌙`/`☀️` | `dark`/`light` | 月亮/太阳，按主题切换 |

### 3.2 Callout 语义图标（8 个）

| type | 现状 | 新图标 | 说明 |
|------|------|--------|------|
| wrong | ❌ | `circle-x` | 圆圈内叉 |
| why | 🔍 | `search` | 放大镜（与顶栏同款，尺寸区分） |
| right | ✅ | `circle-check` | 圆圈内勾 |
| skill | 🎯 | `target` | 同心圆靶心 |
| tip | 💡 | `lightbulb` | 灯泡 |
| note | 📌 | `pin` | 图钉 |
| memory | 🧠 | `brain` | 脑轮廓 |
| formula | 🧮 | `calculator` | 计算器 |

### 3.3 分节图标（6 个）

| 分节 | 现状 | 新图标 |
|------|------|--------|
| overview | 📖 | `book-open` |
| mistakes | ⚠️ | `alert-triangle` |
| exam-points | 🎯 | `target` |
| methods | 🧭 | `compass` |
| mindmap | 🗺️ | `git-branch`（分支结构对应导图） |
| examples | 📝 | `file-pen` |

### 3.4 SolutionSteps（2 个）

| 位置 | 现状 | 新图标 |
|------|------|--------|
| 标题 | 🧭 | `compass` |
| 提示 | 💡 | `lightbulb` |

### 3.5 学科/知识点图标（22 个，逐个审）

| # | slug | 标题 | 现状 | 建议 | 理由 |
|---|------|------|------|------|------|
| 1 | （学科） | 化学 | ⚗️ | `flask` | 蒸馏烧瓶，学科总标识 |
| 2 | avogadro | 阿伏加德罗常数 | `NA` 文本 | `hash` | 计数/常数，同时修正该项与其余 20 项不一致的问题 |
| 3 | matter-classification | 物质的组成与分类 | 🧩 | `layers` | 分层分类，替换与 organic-inference 重复的拼图 |
| 4 | redox | 氧化还原反应 | ⚡ | `arrow-left-right` | 电子转移=双向箭头，避开闪电 |
| 5 | ion-reaction | 离子反应 | 💧 | `droplet` | 溶液中的反应，水滴保留语义但改线性 |
| 6 | metal-sodium | 钠及其化合物 | 🧂 | `flame` | 焰色反应是钠的标志性检验 |
| 7 | metal-iron | 铁及其化合物 | 🧲 | `magnet` | 磁性是铁的标志，语义正确，改线性即可 |
| 8 | metal-aluminum | 铝及其化合物 | 🥫 | `triangle-alert` | 铝三角（Al³⁺/Al(OH)₃/AlO₂⁻ 转化网） |
| 9 | nonmetal-chlorine | 氯及其化合物 | 🟢 | `test-tube` | 氯水三分四离的试管实验，替换无意义绿点 |
| 10 | nonmetal-nitrogen | 氮及其化合物 | 🌩️ | `cloud-lightning` | 雷雨固氮，保语义改线性 |
| 11 | nonmetal-sulfur | 硫及其化合物 | 🌋 | `volcano` | 火山喷发与含硫信息题，语义正确 |
| 12 | nonmetal-silicon | 硅及其化合物 | 🪨 | `gem` | SiO₂ 晶体/硅酸盐，语义正确 |
| 13 | chem-experiment | 化学实验基础 | ⚗️ | `beaker` | 烧杯，与学科 `flask` 区分，消除重复 |
| 14 | titration | 酸碱中和滴定 | 🧪 | `pipette` | 滴定管/滴管，与 beaker 区分 |
| 15 | atom-structure | 原子结构与元素周期律 | ⚛️ | `atom` | 电子层绕核，语义正确 |
| 16 | crystal-properties | 微粒间作用力与晶体 | 💎 | `box` | 晶胞立方体，比宝石更贴「晶胞均摊法」 |
| 17 | molecular-structure | 分子空间结构与物质性质 | 🧬 | `hexagon` | VSEPR/苯环骨架的空间结构，避开 DNA |
| 18 | organic-basis | 研究有机化合物与分类命名 | 🌿 | `clipboard-list` | 分离提纯+波谱定结构的流程清单 |
| 19 | hydrocarbon | 烃 | 🔥 | `flame-kindling` | 燃烧，语义正确 |
| 20 | hydrocarbon-derivatives | 烃的衍生物 | 🧴 | `test-tube-diagonal` | 官能团衍生物，替换洗发水瓶 |
| 21 | polymer-biomolecule | 生物大分子与合成高分子 | 🧶 | `link` | 链节重复结构，替换毛线团 |
| 22 | organic-inference | 有机反应类型与合成推断 | 🧩 | `route` | 合成路线/断键推断，替换重复拼图 |

**需要你确认的点：**

1. 第 5、7、11、12、19 项我判定为「语义正确只改风格」，保留原意；第 3、6、8、9、15、17、18、20、21、22 项改了图形含义。**有没有哪个改动你不认同？**
2. 第 2 项 `avogadro` 从 `NA` 文本改成 `hash` 图标——**是否宁可保留 `NA` 文本更直白？**
3. 重复项处理：`⚗️` 拆成 `flask`/`beaker`，`🧩` 拆成 `layers`/`route`——**认可这个拆法吗？**

## 四、三阶段执行计划

### 阶段 1 · 地基（tokens.css 重建）
- MD3 色板：以 `#4a9eff` 为 seed 生成 primary tonal 系列、surface container 五层、state layer 透明度、语义色重映射，暗/亮双主题。
- shape 圆角阶梯、elevation、UI 层字阶（仅 Header/侧栏/卡片/按钮）。
- 同步 `--markmap-*` 暗色变量。
- 验收：`npm run check` 0 errors → 截图 → 你点头 → 提交 `style: 按 MD3 重建设计令牌与基础样式`

### 阶段 2 · 形态（15 组件 + 导航 DOM）
- Callout 改 tonal container、卡片统一圆角/间距节奏、首页卡片密度重排（解决 P1）。
- 侧栏 selected 指示条 + state layer、顶栏图标按钮 MD3 化。
- 验收：`npm run check` + `npm run build` → 截图对比 → 提交 `style: 组件与导航对齐 MD3 形态`

### 阶段 3 · 图标
- 新建 `src/components/Icon.astro`，内置上表全部 Outlined SVG。
- 替换 Callout(8) / SolutionSteps(2) / Header(4) / topics.ts(28 处) 及 Sidebar/KnowledgeCard/Index 的渲染。
- `topics.ts` 的 `icon` 字段语义从「emoji 字符」改为「图标名」，需要同步改 `KnowledgeCard.astro`、`Sidebar.astro`、`KnowledgeLayout.astro`、`pages/index.astro`、`pages/[subject]/index.astro`。
- AGENTS.md 补硬约束：UI 层禁用 emoji，一律走 `Icon.astro`。
- 验收：`npm run check` + `npm run build` → 提交 `style: 以线性图标替换全部 UI emoji`

### 收尾
- 8 页 after 截图 vs 基线并列对照。
- `npm run build` 确认 22 页正常生成。
