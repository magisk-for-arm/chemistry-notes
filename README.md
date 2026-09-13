# 高中化学要点总结

一个面向高中化学的知识点梳理站点：把易错点讲透，把解题方法讲清楚。当前收录首个知识点「阿伏加德罗常数」，默认使用暗色主题。

## 技术栈

- **Astro 7**：静态站点框架
- **MDX 内容集合**：知识点以 `src/content` 下的 MDX 文件维护
- **KaTeX + mhchem**：数学与化学公式渲染
- **markmap**：思维导图渲染
- **Pagefind**：构建后生成站内搜索索引

## 快速开始

```bash
npm install
npm run dev        # 本地开发
npm run check      # 类型与 Astro 检查
npm run build      # 构建站点并生成搜索索引
npm run preview    # 预览构建产物
```

## 目录结构

- `src/content`：MDX 内容集合，按 `学科/知识点` 组织
- `src/components`：可复用组件（Header、Sidebar、KnowledgeCard 等）
- `src/layouts`：页面布局（BaseLayout、KnowledgeLayout）
- `src/pages`：路由页面
- `templates`：新增内容用的模板

## 如何新增知识点

1. 复制 `templates/knowledge-point/` 到 `src/content/chemistry/<topic>/`（`<topic>` 为新知识点的英文 slug）。
2. 把模板中所有 `REPLACE_TOPIC` 替换为该 slug。
3. 在 `src/utils/topics.ts` 的 `topics` 数组中登记一条元数据（`title`/`icon`/`order`/`summary`/`tags`）。

新增**学科**时，还需在 `src/utils/topics.ts` 的 `subjectList` 中登记一条学科元数据。

## 内容约定

标题（`#`、`##` 等）中不要使用 `$...$` 行内公式，否则会导致目录提取乱码；公式请放在正文中。

## 部署

部署到 Vercel。`vercel.json` 已配置 `framework: astro` 与输出目录 `dist`。站点域名可通过 `SITE_URL` 环境变量指定；未设置时会自动使用 Vercel 提供的 `VERCEL_URL`，本地则回退到 `http://localhost:4321`。
