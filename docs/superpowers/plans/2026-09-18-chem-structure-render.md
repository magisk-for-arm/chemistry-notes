# 化学结构渲染组件（ChemStructure）实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 新增基于 smiles-drawer 的 `ChemStructure.astro` 客户端渲染组件，并把例题五（2024 福建卷 T6，$\ce{N8}$）改为「看图推断」，销掉题库最终审查的 Important #1（题干泄题）。

**架构：** 照搬 `MarkmapView.astro` 的客户端岛模式——服务端只渲染空容器，`<script>` 里 import 库并挂载；主题用 `MutationObserver` 监听 `data-theme` 重绘。

**技术栈：** Astro 7 + `smiles-drawer@^2.4.1`（MIT，ESM 入口 `exports['.'].import`）。

**依据规格：** `docs/superpowers/specs/2026-09-18-chem-structure-render-design.md`

**关键事实（已核实）：**
- 例题五的 $\ce{N8}$ = 1-叠氮基五唑（五唑环 + 线性叠氮基），SMILES `[N-]=[N+]=Nn1nnnn1` 经 PubChem 渲染核对无误（分子式 N8）；
- 备用 SMILES（非芳香式）：`[N-]=[N+]=NN1N=NN=N1`；
- 站点主题变量在 `<html data-theme>`，取值 `dark`（默认）/`light`。

---

## 文件结构

| 文件 | 动作 | 职责 |
|------|------|------|
| `package.json` | 修改 | 新增 `smiles-drawer` 依赖 |
| `src/components/ChemStructure.astro` | 新建 | SMILES → SVG 客户端渲染岛 |
| `src/styles/components.css` | 修改 | `.chem-figure` 样式（用 CSS 变量） |
| `src/content/chemistry/avogadro/examples.mdx` | 修改 | 例题五改为看图推断 |
| `templates/knowledge-point/examples.mdx` | 修改 | 加 ChemStructure 用法示例 |
| `AGENTS.md` | 修改 | 组件清单补 ChemStructure 说明 |

---

## 任务 1：安装 smiles-drawer

**文件：**
- 修改：`package.json`

- [ ] **步骤 1：安装依赖**

```bash
npm install smiles-drawer
```

预期：`package.json` 的 `dependencies` 出现 `"smiles-drawer": "^2.4.1"`（或更高 2.x）。

- [ ] **步骤 2：确认现有检查不受影响**

运行：`npm run check`
预期：`0 errors`（安装依赖本身不应引入类型错误）。

- [ ] **步骤 3：Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: 引入 smiles-drawer 依赖（MIT，用于化学结构渲染）"
```

---

## 任务 2：新建 ChemStructure 组件与样式

**文件：**
- 创建：`src/components/ChemStructure.astro`
- 修改：`src/styles/components.css`（文件末尾追加一节）

- [ ] **步骤 1：写入组件**

`src/components/ChemStructure.astro` 完整内容：

```astro
---
interface Props {
  smiles: string;
  caption?: string;
  height?: string;
  alt?: string;
}
const { smiles, caption, height = '200px', alt } = Astro.props;
const label = alt ?? caption ?? '化学结构式';
---
<figure class="chem-figure">
  <div
    class="chem-canvas"
    data-smiles={smiles}
    style={`min-height:${height}`}
    role="img"
    aria-label={label}
  >
  </div>
  {caption && <figcaption class="chem-caption">{caption}</figcaption>}
  <noscript><p class="chem-caption">结构式需要启用 JavaScript 后渲染。</p></noscript>
</figure>
<script>
  import SmilesDrawer from 'smiles-drawer';

  interface DrawerLike {
    draw(tree: unknown, target: HTMLElement, theme: string): void;
  }

  function currentTheme(): 'dark' | 'light' {
    return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  }

  function renderFallback(el: HTMLElement, smiles: string): void {
    el.replaceChildren();
    const code = document.createElement('code');
    code.className = 'chem-fallback';
    code.textContent = smiles;
    const tip = document.createElement('p');
    tip.className = 'chem-caption';
    tip.textContent = '结构渲染失败，以上为原始 SMILES。';
    el.append(code, tip);
  }

  function render(el: HTMLElement): void {
    const smiles = el.dataset.smiles ?? '';
    if (!smiles) return;
    const styles = getComputedStyle(el);
    const width = Math.max(el.clientWidth, 240);
    const height = Math.max(parseInt(styles.minHeight, 10) || 200, 120);
    try {
      const drawer = new SmilesDrawer.SvgDrawer({ width, height, padding: 12 }) as unknown as DrawerLike;
      SmilesDrawer.parse(
        smiles,
        (tree: unknown) => {
          el.replaceChildren();
          drawer.draw(tree, el, currentTheme());
        },
        () => renderFallback(el, smiles),
      );
    } catch {
      renderFallback(el, smiles);
    }
  }

  function renderAll(): void {
    document.querySelectorAll<HTMLElement>('.chem-canvas').forEach(render);
  }

  function init(): void {
    renderAll();
    new MutationObserver(renderAll).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
</script>
```

类型提示：`smiles-drawer` 自带 `dist/types/app.d.ts`，若其类型与 `SmilesDrawer.SvgDrawer`/`parse` 的实际签名不完全匹配，按上面的 `DrawerLike` + `as unknown as` 方式收敛，**不得使用 `@ts-ignore` / `@ts-expect-error` 压制错误**。

- [ ] **步骤 2：追加样式**

在 `src/styles/components.css` 文件末尾追加（保持该文件既有的分节注释风格）：

```css
/* ============ 化学结构图（ChemStructure） ============ */
.chem-figure {
  margin: 1.25rem 0;
  padding: 0.75rem;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius);
  background: var(--surface);
  text-align: center;
}

.chem-figure .chem-canvas svg {
  max-width: 100%;
  height: auto;
}

.chem-caption {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.chem-fallback {
  display: block;
  margin: 0 auto;
  max-width: 100%;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text);
  word-break: break-all;
}
```

- [ ] **步骤 3：验证**

运行：`npm run check`
预期：`0 errors`。

- [ ] **步骤 4：Commit**

```bash
git add src/components/ChemStructure.astro src/styles/components.css
git commit -m "feat: 新增 ChemStructure 组件——smiles-drawer 客户端渲染化学结构（亮暗主题自适应重绘）"
```

---

## 任务 3：例题五改为看图推断

**文件：**
- 修改：`src/content/chemistry/avogadro/examples.mdx`

- [ ] **步骤 1：文件顶部 import 区加入组件**

在 examples.mdx 顶部现有 import 块（`ExampleCard`/`Reveal`/`Callout` 之后）追加一行：

```mdx
import ChemStructure from '@/components/ChemStructure.astro';
```

- [ ] **步骤 2：替换例题五题干（删除泄题描述）**

将题干：

```mdx
我国科学家预测了稳定的氮单质分子 $\ce{N8}$（结构如图，原图略：8 个 N 原子共面，其中 6 个为 $sp^2$ 杂化、2 个为 $sp$ 杂化，6 个 N 各有一对孤电子）。设 $N_A$ 为阿伏加德罗常数的值，下列说法**错误**的是（　　）
```

替换为：

```mdx
我国科学家预测了稳定的氮单质分子 $\ce{N8}$（结构如图所示，1-叠氮基五唑：五元氮环上连有一条三个氮原子的链）。设 $N_A$ 为阿伏加德罗常数的值，下列说法**错误**的是（　　）

<ChemStructure smiles="[N-]=[N+]=Nn1nnnn1" caption="N₈ 分子（1-叠氮基五唑）的结构" alt="一个五元氮环，其中一个氮原子连接一条由三个氮原子组成的直线形链" />
```

- [ ] **步骤 3：重写解析 A 与 B（补推断链），C 补一句来源**

A 项 `right` Callout 的正文替换为：

```mdx
由结构数 σ 键：五唑环 5 条 + 环与叠氮基连接 1 条 + 叠氮链内 2 条，共 8 条；每条 σ 键含 2 个电子，1.0 mol 为 $16N_A$。
```

B 项 `wrong` Callout 的标题保持「B ❌ 孤电子对数数错（本题答案）」，正文替换为：

```mdx
由结构推断杂化：五唑环上 5 个 N 均以 2 条环内 σ 键成环，为 $sp^2$（其中连接叠氮基的 N 再多出 1 条环外 σ 键、无孤电子对，其余 4 个 N 各带 1 对孤电子）；叠氮基呈直线形，首端 N 成 2 条 σ 键并带 1 对孤电子，为 $sp^2$；中、末 2 个 N 为 $sp$。孤电子对共 6 对（环上 4 对 + 叠氮首端 1 对 + 叠氮末端 1 对），1.0 mol 应为 $6N_A$，不是 $7N_A$。
```

C 项 `right` Callout 的正文替换为：

```mdx
由 B 项推断：$sp^2$ 杂化的 N 共 6 个（环上 5 个 + 叠氮首端 1 个），故为 $6N_A$。
```

D 项保持不变。

- [ ] **步骤 4：验证**

运行：`npm run check`
预期：`0 errors`。

- [ ] **步骤 5：Commit**

```bash
git add src/content/chemistry/avogadro/examples.mdx
git commit -m "content: 例题五改为看图推断——ChemStructure 渲染 N₈ 结构，题干不再泄题"
```

---

## 任务 4：模板与 AGENTS.md

**文件：**
- 修改：`templates/knowledge-point/examples.mdx`
- 修改：`AGENTS.md`

- [ ] **步骤 1：模板加用法示例**

在 `templates/knowledge-point/examples.mdx` 顶部 import 区追加：

```mdx
import ChemStructure from '@/components/ChemStructure.astro';
```

并在文件末尾（`</ExampleCard>` 之后）追加：

```mdx
<!-- 结构式：把 SMILES 传给 ChemStructure（SMILES 须先用 PubChem 等验证，再入库） -->
<!-- <ChemStructure smiles="CCO" caption="乙醇" /> -->
```

（以 HTML 注释形式给出，避免模板渲染出未验证的示例结构。）

- [ ] **步骤 2：AGENTS.md 组件说明**

在 `AGENTS.md` 的「目录地图」`components/` 行后（或「常见任务 → 修改思维导图」一节附近）追加一小节：

```md
### 插入化学结构图

- 用 `<ChemStructure smiles="..." caption="..." />` 渲染结构式（组件在 `src/components/ChemStructure.astro`，基于 smiles-drawer 客户端渲染，自动跟随亮暗主题重绘）。
- **SMILES 必须先经外部渲染器验证**（如 PubChem PUG-REST）再入库，禁止凭记忆书写；非常规结构（如 $\ce{N8}$、晶胞）SMILES 无法表达时，改用 `<img>` 引用 `public/images/` 下的静态 SVG。
```

- [ ] **步骤 3：验证与 Commit**

运行：`npm run check`（预期 `0 errors`）

```bash
git add templates/knowledge-point/examples.mdx AGENTS.md
git commit -m "docs: 模板与 AGENTS.md 补充 ChemStructure 用法与 SMILES 验证要求"
```

---

## 任务 5：整体验证（含渲染核对）

**文件：**
- 无（如需回退改动见步骤 4）

- [ ] **步骤 1：构建**

```bash
npm run build
```

预期：构建成功、页面数不减（23 页基准）。

- [ ] **步骤 2：浏览器目测**

`npm run dev` 后打开 `http://localhost:4321/chemistry/avogadro/examples`：
- 例题五出现结构图（五唑环 + 叠氮链）、图注可读；
- 亮/暗主题切换时结构图即时重绘且线条可读；
- 页面无 console 报错。

- [ ] **步骤 3：视觉核对**

对渲染出的结构截图，与 `/tmp/opencode/n8_smiles1.png`（PubChem 参考图）核对：均为五元氮环 + 3 原子直线链。可用视觉子代理核对。

- [ ] **步骤 4：渲染异常时的回退（仅当步骤 2/3 失败）**

按顺序尝试：
1. 把 `examples.mdx` 中例题五的 SMILES 换为备用式：`[N-]=[N+]=NN1N=NN=N1`，重复步骤 2–3；
2. 仍异常：回退为静态图——手绘 `public/images/n8-structure.svg`（五唑环 + 叠氮链，已核实拓扑），例题五改用 `<img src="/images/n8-structure.svg" alt="..." />`，并在 commit message 注明原因。

每一步回退都要 commit：

```bash
git add -A
git commit -m "fix: 例题五结构渲染回退（原因）"
```

- [ ] **步骤 5：收尾**

`npm run check` 最终确认 0 errors；如有未提交修改，按上述方式提交。
