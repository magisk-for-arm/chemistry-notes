// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import { fileURLToPath } from 'node:url';
import rehypeKatexMhchem from './src/plugins/rehype-katex-mhchem.mjs';
import rehypeBaseLinks from './src/plugins/rehype-base-links.mjs';

export default defineConfig({
  // 部署子路径：GitHub Pages 项目站注入 BASE_PATH=/chemistry-notes，Vercel 与本地不设（回落 '/'）
  base: process.env.BASE_PATH || '/',
  site:
    process.env.SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:4321'),
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      [rehypeKatexMhchem, { throwOnError: false, strict: false }],
      // Markdown 正文里的站内绝对链接补 base 前缀（正文无法调用 withBase()）
      [rehypeBaseLinks, { base: process.env.BASE_PATH || '/' }],
    ],
  },
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
});
