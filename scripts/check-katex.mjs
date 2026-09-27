#!/usr/bin/env node
/**
 * 用 remark-math 解析每个 mdx，把所有 $...$ / $$...$$ 交给 KaTeX 的
 * throwOnError 严格模式渲染一遍：任何语法错、未知命令、缺字形都会抛错。
 *
 * 为什么需要它：
 *   - `astro check` 完全不碰 MDX 里的公式；
 *   - `astro build` 里 KaTeX 是非严格的，公式出错只在产物里悄悄留下
 *     <span class="katex-error">，构建照样成功；
 *   - 所以「公式到底能不能渲染」必须单独验。
 *
 * 用法：node scripts/check-katex.mjs [目录...]
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const katex = require('katex');
const { unified } = require('unified');
// remark-* 是 ESM-only，require 拿到的是 namespace，统一取 default
const remarkParse = require('remark-parse').default;
const remarkMath = require('remark-math').default;

const problems = [];
let formulaCount = 0;
let fileCount = 0;

function scan(file) {
  fileCount++;
  const raw = fs.readFileSync(file, 'utf8');
  const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  const tree = unified().use(remarkParse).use(remarkMath).parse(body);

  const visit = (node) => {
    if (node.type === 'math' || node.type === 'inlineMath') {
      formulaCount++;
      const displayMode = node.type === 'math';
      try {
        katex.renderToString(node.value, { throwOnError: true, displayMode, strict: 'error' });
      } catch (e) {
        problems.push(
          `${file}: 公式渲染失败 → ${node.value.slice(0, 60)} || ${String(e.message).split('\n')[0]}`,
        );
        return;
      }
      // \text{…} 里的中文是**正确**用法（KaTeX 按 upright 排），先剥掉；
      // 剩下的裸中文才是问题（会渲染成错误的斜体字形）。
      const stripped = node.value.replace(
        /\\(?:text|textbf|textit|textrm|mbox|hbox|mathrm|mathbf|operatorname)\s*\{[^{}]*\}/g,
        '',
      );
      const cjk = stripped.match(/[\u4e00-\u9fff]/g);
      if (cjk) {
        problems.push(
          `${file}: 中文「${[...new Set(cjk)].join('')}」裸写进 math 模式，应包 \\text{} → ${node.value.slice(0, 70)}`,
        );
      }
      const accented = stripped.match(/[\u0233\u0233\u0177\u1e8b]/g);
      if (accented) {
        problems.push(
          `${file}: 组合字符「${[...new Set(accented)].join('')}」在 math 模式不可靠，应写 \\bar{} → ${node.value.slice(0, 70)}`,
        );
      }
      return;
    }
    if (node.children) node.children.forEach(visit);
  };
  visit(tree);
}

function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith('.mdx')) scan(p);
  }
}

const roots = process.argv.slice(2);
for (const t of roots.length ? roots : ['src/content/math']) walk(t);

if (problems.length) {
  console.error(
    `KaTeX 严格模式发现 ${problems.length} 处问题（共检查 ${fileCount} 文件 / ${formulaCount} 公式）：`,
  );
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log(`KaTeX 严格模式通过：${fileCount} 个文件、${formulaCount} 条公式全部可渲染`);
