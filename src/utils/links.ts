/**
 * 站内链接 base 前缀工具。
 * base 由 astro.config.mjs 的 BASE_PATH 环境变量决定：
 * 未设置（Vercel/本地）→ '/'，链接行为与历史版本完全一致；
 * GitHub Actions 注入 → '/chemistry-notes'，链接自动加前缀。
 */
const raw = import.meta.env.BASE_URL; // '/' 或 '/chemistry-notes'
const prefix = raw === '/' ? '' : raw.replace(/\/+$/, '');

/** 给站内绝对路径加 base 前缀。只处理以 / 开头的路径，外链原样返回。 */
export function withBase(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  if (path === '/') return `${prefix}/`;
  return `${prefix}${path}`;
}

/** 去掉 pathname 里的 base，得到站内相对路径（用于导航高亮判定）。 */
export function stripBase(pathname: string): string {
  if (!prefix) return pathname;
  if (pathname === prefix) return '/';
  if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  return pathname;
}
