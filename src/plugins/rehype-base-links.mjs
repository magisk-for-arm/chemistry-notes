/**
 * rehype 插件：给 Markdown/MDX 正文里手写的站内绝对链接补 base 前缀。
 *
 * 正文里的 `[概览](/chemistry/organic-inference/)` 没法直接调用
 * `src/utils/links.ts` 的 `withBase()`（内容文件被约定为纯 MDX，不允许改写），
 * 因此在渲染管线里统一改写，判定逻辑与 `withBase()` 完全一致：
 * 只处理以 `/` 开头且不是 `//` 的路径，外链 / 锚点 / 协议相对链接原样保留。
 *
 * @param {{ base?: string }} [options] base 由 astro.config.mjs 传入
 */
export default function rehypeBaseLinks(options = {}) {
  const raw = options.base || '/';
  const prefix = raw === '/' ? '' : String(raw).replace(/\/+$/, '');

  return (tree) => {
    // 根路径部署（Vercel / 本地）时不做任何改写，行为与历史版本一致
    if (!prefix) return;
    walk(tree);
  };

  function walk(node) {
    if (node.type === 'element' && node.properties) {
      for (const attr of ['href', 'src']) {
        const value = node.properties[attr];
        if (typeof value === 'string') node.properties[attr] = withBase(value);
      }
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) walk(child);
    }
  }

  function withBase(path) {
    if (!path.startsWith('/') || path.startsWith('//')) return path;
    if (path === '/') return `${prefix}/`;
    return `${prefix}${path}`;
  }
}
