# 化学结构渲染组件设计（ChemStructure）

- 日期：2026-09-18
- 状态：已批准（用户选定 SmilesDrawer 方案）
- 范围：新增结构渲染组件 + 例题五改用结构图（销掉题库最终审查的 Important #1）
- 关联：`docs/superpowers/specs/2026-09-14-examples-question-bank-design.md`（题库规格，其中「例题五原图略」由本设计取代）

## 1. 目标

让站点能直接展示化学结构图（分子结构式），首个用例是 2024 福建卷 T6 的 $\ce{N8}$（1-叠氮基五唑）。恢复该真题「由结构推断杂化/孤对」的推理价值，题干不再文字泄题。

## 2. 选型（已核实）

- **smiles-drawer** v2.4.1，MIT，纯 JS（无 WASM），包内有标准 ESM 入口（`exports['.'].import = ./dist/smiles-drawer.min.mjs`），Astro/Vite 直接 `import SmilesDrawer from 'smiles-drawer'`。
- 备选否决：`@rdkit/rdkit`（WASM ~7MB，偏重）、`ketcher-core`（~24MB 编辑器，不适合阅读站）。
- SMILES 已验证：`[N-]=[N+]=Nn1nnnn1` 经 PubChem 渲染确认是五唑环（2 个双键）+ 线性叠氮（N=N⁺=N⁻），分子式 N8；与论文《Nonbonding Electron Delocalization Stabilizes the Flexible N8 Molecular Assembly》(JPCL 2024) 及真题解析的 8σ 键 / 6 sp² / 2 sp / 6 孤电子对全部吻合。

## 3. 组件设计

`src/components/ChemStructure.astro`（新建，沿用 `MarkmapView.astro` 的客户端渲染岛模式）：

- Props：`smiles`（必填 string）、`caption`（可选图注）、`height`（可选，默认 `200px`）、`alt`（可选，无障碍描述，缺省用 caption 或「化学结构式」）。
- 服务端输出：`<figure class="chem-figure">` 内一个空 `<div class="chem-canvas" data-smiles=...>`，不含重量级 HTML。
- 客户端：`SmilesDrawer.parse` → `SvgDrawer.draw(tree, target, theme)`；`theme` 按 `document.documentElement.dataset.theme` 取 `'dark' | 'light'`。
- **主题重绘**：`MutationObserver` 监听 `<html>` 的 `data-theme` 属性变化，变化后全部重绘（站点无客户端路由切换主题外的情况）。
- **失败兜底**：`parse` 的 error 回调与 `try/catch` 中，在容器内显示原 SMILES 等宽文本 + 一行「结构渲染失败」提示；`<noscript>` 提示需启用 JS。
- **不做**：全屏/缩放/复制按钮（YAGNI）；不支持静态图 `src`（当前唯一用例是 SMILES，需要静态图时直接 `<img>` 即可）。

## 4. 样式

`src/styles/components.css` 新增 `.chem-figure`：边框 `var(--border-soft)`、背景 `var(--surface)`、圆角 `var(--radius)`、图注 `var(--text-muted)`；`prefers-reduced-motion` 无关（无动画）。**不硬编码颜色**。

## 5. 例题五改写（examples.mdx）

- 题干删去「原图略：……6 个为 $sp^2$ 杂化、2 个为 $sp$ 杂化，6 个 N 各有一对孤电子」的泄题描述，改为「结构如图所示」+ `<ChemStructure smiles="[N-]=[N+]=Nn1nnnn1" caption="N₈ 分子（1-叠氮基五唑）的结构" />`。
- 解析补推断链（学生看图应能推出）：
  - A 对：σ 键 = 环 5 + 环-叠氮 1 + 叠氮 2 = 8，每键 2 电子 → 16N_A；
  - B 错（答案）：$sp^2$ 的 N 有 6 个（环上 5 个 + 叠氮首 N），孤电子对 = 环上 4 对 + 叠氮首、末各 1 对 = 6 对 → 6N_A，不是 7N_A；
  - C 对：$sp^2$ 杂化 N 原子数 6 → 6N_A；
  - D 对：$M(\ce{N8})=112$，112 g = 1 mol → 4 mol $\ce{N2}$ = 4N_A。
- `source` 保持 `2024 · 福建卷 · T6`（确为该卷真题，结构图经论文 SI 核实）。

## 6. 模板与其他

- `templates/knowledge-point/examples.mdx` 增加 `<ChemStructure>` 一行用法示例（注释说明 SMILES 需先验证）。
- `AGENTS.md` 组件清单处补一句 ChemStructure 的用途与 SMILES 验证要求（供后续代理）。

## 7. 风险与兜底

1. ~~SmilesDrawer 对「5 个芳香氮」的五唑解析可能不完美~~ → **实际结论（2026-09-18 实测）**：芳香式 SMILES `[N-]=[N+]=Nn1nnnn1` 解析与渲染均正常；此前的「渲染失败」实为组件 bug——`SvgDrawer.draw` 的第二参数必须是 `<svg>` 元素（传 `<div>` 会抛 "Second argument was not an SVG"），且需显式设置 SVG 尺寸/viewBox，否则宽高为 0。已修复（commit 2e6bff3）。**未使用静态图兜底**（`public/images/` 未新增）。
2. 包体积：客户端 `ChemStructure` 脚本 188KB（构建实测），仅含结构图的页面加载；接受。
3. 主题重绘实测：切换 `data-theme` 后 SVG 文字色由 `rgb(24,32,42)` 变为 `rgb(230,233,238)`，重绘生效。
4. 响应式实测：桌面 360×93、移动端 272×70，均在容器内自适应。

## 8. 验证

1. `npm run check` 0 errors；
2. `npm run build` 通过、页数不减；
3. `npm run dev` 浏览器目测：亮/暗两主题下结构图正常渲染、切换主题即时重绘、图注可读；
4. 视觉核对：渲染出的结构与 PubChem 参考图一致（五唑环 + 叠氮链）；
5. 例题五重读：题干不含杂化/孤对数字，解析含完整推断链。
