import 'katex/contrib/mhchem';
import rehypeKatex from 'rehype-katex';

/**
 * 包装 rehype-katex，确保 mhchem 扩展在与 rehype-katex 相同的 katex 实例上注册，
 * 从而支持化学式 \ce{} / \pu{}。
 */
export default function rehypeKatexMhchem(options = {}) {
  return rehypeKatex(options);
}
