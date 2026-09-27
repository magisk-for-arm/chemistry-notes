#!/usr/bin/env node
/**
 * MDX 标签配对自检。
 * astro check 不校验 MDX 语法（漏写 </Callout> 仍报 0 errors），只有 build 才失败。
 * 本脚本在 build 之前静态扫出未闭合 / 错配的标签，快速定位到行号。
 *
 * 用法：node scripts/check-mdx-tags.mjs [目录...]
 */
import fs from 'node:fs';
import path from 'node:path';

// 视为容器的组件：必须自闭合或成对出现
const TAGS = [
  'MistakeCard',
  'ExampleCard',
  'SolutionSteps',
  'Reveal',
  'Callout',
  'TagBadge',
  'Icon',
  'ChemStructure',
  'MarkmapView',
];

const problems = [];

function scan(file) {
  const text = fs.readFileSync(file, 'utf8');
  // 去掉 frontmatter 与 HTML 注释、行内代码，避免注释/反引号里的标签干扰
  const body = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, (m) => m.replace(/[<>]/g, ''));
  const stripped = body
    .replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[<>]/g, ''))
    // 行内代码：连续奇数个反引号围起来的内容
    .replace(/(`+)(?:[\s\S]*?)\1/g, (m) => m.replace(/[<>]/g, ''))
    // 围栏代码块
    .replace(/^```[\s\S]*?^```/gm, (m) => m.replace(/[<>]/g, ''));

  const stack = [];
  let i = 0;
  while (i < stripped.length) {
    const lt = stripped.indexOf('<', i);
    if (lt === -1) break;
    // 判断是否为标签：</ 或 <大写字母
    const rest = stripped.slice(lt);
    if (!/^<\/?[A-Z]/.test(rest)) {
      i = lt + 1;
      continue;
    }
    const nameMatch = rest.match(/^<\/?([A-Z][A-Za-z0-9]*)/);
    const name = nameMatch[1];
    const closing = rest[1] === '/';
    // 从标签名之后开始扫描，跳过引号内的内容，找到未加引号的 '>'
    let j = lt + nameMatch[0].length;
    let quote = null;
    let selfClose = false;
    let end = -1;
    for (; j < stripped.length; j++) {
      const c = stripped[j];
      if (quote) {
        if (c === quote) quote = null;
        continue;
      }
      if (c === '"' || c === "'") {
        quote = c;
        continue;
      }
      if (c === '{') {
        // JSX 表达式容器，内部整体跳过（含字符串）
        let depth = 1;
        j++;
        let q = null;
        while (j < stripped.length && depth > 0) {
          const d = stripped[j];
          if (q) {
            if (d === q) q = null;
          } else if (d === '"' || d === "'") q = d;
          else if (d === '{') depth++;
          else if (d === '}') depth--;
          j++;
        }
        j--;
        continue;
      }
      if (c === '>') {
        selfClose = stripped[j - 1] === '/';
        end = j;
        break;
      }
    }
    if (end === -1) {
      i = lt + 1;
      continue;
    }
    const line = stripped.slice(0, lt).split('\n').length;
    if (TAGS.includes(name) && !selfClose) {
      if (closing) {
        const top = stack.pop();
        if (!top) {
          problems.push(`${file}:${line} 多余的 </${name}>`);
        } else if (top.name !== name) {
          problems.push(`${file}:${line} </${name}> 与第 ${top.line} 行的 <${top.name}> 错配`);
        }
      } else {
        stack.push({ name, line });
      }
    }
    i = end + 1;
  }
  for (const left of stack) {
    problems.push(`${file}:${left.line} <${left.name}> 未闭合`);
  }

  // 附带检查：mistakes 页每张 MistakeCard 是否齐四个 Callout
  if (path.basename(file) === 'mistakes.mdx') {
    const cards = [...text.matchAll(/<MistakeCard\b/g)].length;
    const skills = [...text.matchAll(/<Callout type="skill"/g)].length;
    const whats = [...text.matchAll(/<Callout type="wrong"/g)].length;
    const whys = [...text.matchAll(/<Callout type="why"/g)].length;
    const rights = [...text.matchAll(/<Callout type="right"/g)].length;
    if (cards > 0 && (cards !== skills || cards !== whats || cards !== whys || cards !== rights)) {
      problems.push(
        `${file} 四段式不齐：MistakeCard ${cards} 条 / wrong ${whats} / why ${whys} / right ${rights} / skill ${skills}`,
      );
    }
  }

  // mindmap 不得含 import 或组件
  if (path.basename(file) === 'mindmap.mdx') {
    if (/^import\s/m.test(text)) problems.push(`${file} mindmap 正文含 import`);
    if (/<[A-Z]/.test(text)) problems.push(`${file} mindmap 正文含组件标签`);
  }

  // 标题不得含行内公式
  const badHead = text.match(/^#{1,4} .*\$[^$]+\$.*$/m);
  if (badHead) problems.push(`${file} 标题含行内公式：${badHead[0].slice(0, 60)}`);

  // Markdown 表格单元格里的字面 `|`（如 \left|x\right|）会把整行切断，
  // 公式因此原样输出。正确写法是 \lvert … \rvert。
  text.split('\n').forEach((line, i) => {
    if (!line.trim().startsWith('|')) return;
    const cells = (line.match(/(?<!\\)\|/g) || []).length;
    if (cells < 2) {
      problems.push(`${file}:${i + 1} 表格行的管道数异常（${cells}），疑似公式里的 | 截断了表格 → ${line.slice(0, 70)}`);
    }
  });
}

function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith('.mdx')) scan(p);
  }
}

const roots = process.argv.slice(2);
const targets = roots.length ? roots : ['src/content'];
for (const t of targets) walk(t);

if (problems.length) {
  console.error(`发现 ${problems.length} 处问题：`);
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log('MDX 标签配对检查通过');
