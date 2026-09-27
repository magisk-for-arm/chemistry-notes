#!/usr/bin/env node
/**
 * 扫描 MDX 里的 JSX props（title / tip / model / source / caption 等）中是否含 $...$。
 *
 * 背景：这些属性值是 JS 字符串，**不经过 remark/rehype 的 KaTeX 渲染管线**，
 * 所以里面的 $...$ 会在页面上原样显示成字面量美元符与花括号，而不是公式。
 * 属于「astro check 不报、build 也不报、但页面上是坏的」的一类问题。
 *
 * 用法：node scripts/check-jsx-props.mjs [目录...]
 */
import fs from 'node:fs';
import path from 'node:path';

const ATTR = /\b(title|tip|model|source|caption|label|summary|alt)\s*=\s*"([^"]*)"/g;
const STEPS_BLOCK = /steps\s*=\s*\{/g;

const problems = [];

/** 从 `steps={` 的 `{` 开始做花括号配对，返回整块源码与结束下标。 */
function matchBraceBlock(text, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) return [text.slice(openIdx, i + 1), i];
    }
  }
  return [text.slice(openIdx), text.length - 1];
}

function scan(file) {
  const text = fs.readFileSync(file, 'utf8');
  const lineOf = (idx) => text.slice(0, idx).split('\n').length;

  let m;
  ATTR.lastIndex = 0;
  while ((m = ATTR.exec(text)) !== null) {
    if (m[2].includes('$')) {
      problems.push(`${file}:${lineOf(m.index)} <${m[1]}="${m[2].slice(0, 60)}"> 属性里含 $，不会渲染成公式`);
    }
  }

  // steps={[…]} 的元素是 JS 字符串，整个数组里出现 $ 就是 bug。
  // 这里只判「整块是否含 $」，不做引号配对——文件里同时存在 '…'、"…"、$…$、`…`，
  // 任何基于引号计数的配对都会误判（这个坑踩过）。
  STEPS_BLOCK.lastIndex = 0;
  while ((m = STEPS_BLOCK.exec(text)) !== null) {
    const openIdx = m.index + m[0].length - 1;
    const [block] = matchBraceBlock(text, openIdx);
    if (block.includes('$')) {
      const inner = block
        .split('\n')
        .filter((l) => l.includes('$'))
        .map((l) => l.trim())
        .join(' | ');
      problems.push(`${file}:${lineOf(openIdx)} steps 数组里含 $，不会渲染成公式 → ${inner.slice(0, 90)}`);
    }
  }
}

function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith('.mdx')) scan(p);
  }
}

const roots = process.argv.slice(2);
for (const t of roots.length ? roots : ['src/content']) walk(t);

if (problems.length) {
  console.error(`发现 ${problems.length} 处 JSX 属性里的 $（页面上会显示成字面量）：`);
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log('JSX 属性检查通过（title/tip/model/steps 中无未渲染的 $）');
