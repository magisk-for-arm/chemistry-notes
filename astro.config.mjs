// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import { fileURLToPath } from 'node:url';
import rehypeKatexMhchem from './src/plugins/rehype-katex-mhchem.mjs';

export default defineConfig({
  site: 'https://chemistry-notes.example.com',
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatexMhchem, { throwOnError: false, strict: false }]],
  },
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
});
