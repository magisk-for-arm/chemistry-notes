import type { IconName } from './icons';

export interface SubjectMeta {
  slug: string;
  title: string;
  description: string;
  icon: IconName;
  order: number;
}

export interface TopicMeta {
  slug: string;
  subject: string;
  title: string;
  icon: IconName;
  order: number;
  summary: string;
  tags: string[];
}

export const subjectList: SubjectMeta[] = [
  {
    slug: 'chemistry',
    title: '化学',
    description: '高中化学要点 · 易错点 · 考点 · 解题方法',
    icon: 'flask',
    order: 1,
  },
];

export const topics: TopicMeta[] = [
  {
    slug: 'avogadro',
    subject: 'chemistry',
    title: '阿伏加德罗常数',
    icon: 'hash',
    order: 1,
    summary: '物质的量计算的核心，高考选择题的高频陷阱区',
    tags: ['物质的量', '气体摩尔体积', '氧化还原'],
  },
  {
    slug: 'matter-classification',
    subject: 'chemistry',
    title: '物质的组成与分类',
    icon: 'layers',
    order: 11,
    summary: '分类体系、电解质、胶体与化学常识，STSE 题的地基',
    tags: ['物质的分类', '胶体', 'STSE'],
  },
  {
    slug: 'redox',
    subject: 'chemistry',
    title: '氧化还原反应',
    icon: 'arrow-left-right',
    order: 12,
    summary: '概念网、强弱规律、配平流程与电子守恒速算',
    tags: ['氧化还原', '计算'],
  },
  {
    slug: 'ion-reaction',
    subject: 'chemistry',
    title: '离子反应',
    icon: 'droplet',
    order: 13,
    summary: '离子方程式书写与正误判断、离子共存与检验推断',
    tags: ['离子反应'],
  },
  {
    slug: 'metal-sodium',
    subject: 'chemistry',
    title: '钠及其化合物',
    icon: 'flame',
    order: 21,
    summary: '钠三角、过氧化钠记账、碳酸钠与碳酸氢钠对比及焰色反应',
    tags: ['金属元素'],
  },
  {
    slug: 'metal-iron',
    subject: 'chemistry',
    title: '铁及其化合物',
    icon: 'magnet',
    order: 22,
    summary: '铁三角、硝酸三档配比、Fe(OH)₂ 防氧化与 Fe²⁺/Fe³⁺ 检验，附铜的联动',
    tags: ['金属元素', '氧化还原'],
  },
  {
    slug: 'metal-aluminum',
    subject: 'chemistry',
    title: '铝及其化合物',
    icon: 'triangle-alert',
    order: 23,
    summary: '铝三角与互滴图像、氢氧化铝制备路线评价，附镁、海水提镁与金属冶炼',
    tags: ['金属元素', '离子反应'],
  },
  {
    slug: 'nonmetal-chlorine',
    subject: 'chemistry',
    title: '氯及其化合物',
    icon: 'test-tube',
    order: 24,
    summary: '氯水三分四离、制备四件套与熄火陷阱、漂白三体系、卤族递变与海水资源',
    tags: ['非金属元素', '氧化还原'],
  },
  {
    slug: 'nonmetal-nitrogen',
    subject: 'chemistry',
    title: '氮及其化合物',
    icon: 'cloud-lightning',
    order: 25,
    summary: '价态阶梯、NO/NO₂ 补氧计算、氨与喷泉、铵盐检验、硝酸两档氧化性与混合酸限量',
    tags: ['非金属元素', '氧化还原'],
  },
  {
    slug: 'nonmetal-sulfur',
    subject: 'chemistry',
    title: '硫及其化合物',
    icon: 'mountain',
    order: 26,
    summary: 'SO₂ 四重身份与褪色三机理、浓硫酸三性、SO₄²⁻ 检验、酸雨与含硫信息题',
    tags: ['非金属元素', '氧化还原'],
  },
  {
    slug: 'nonmetal-silicon',
    subject: 'chemistry',
    title: '硅及其化合物',
    icon: 'gem',
    order: 27,
    summary: '硅与碱放氢、SiO₂ 结构与五路反应、硅酸两档与酸性验证链、高纯硅三步法、无机非金属材料',
    tags: ['非金属元素', '无机非金属材料'],
  },
  {
    slug: 'chem-experiment',
    subject: 'chemistry',
    title: '化学实验基础',
    icon: 'beaker',
    order: 31,
    summary: '仪器三梯队与容量红线、检漏与气密性三步句、干燥剂配对、气体制备五站链、文字描述题采分模板',
    tags: ['化学实验'],
  },
  {
    slug: 'titration',
    subject: 'chemistry',
    title: '酸碱中和滴定',
    icon: 'pipette',
    order: 32,
    summary: '滴定管三系与读数、操作七步、指示剂选择、终点句式、误差矩阵、氧化还原滴定与守恒桥计算',
    tags: ['滴定', '化学实验'],
  },
  {
    slug: 'atom-structure',
    subject: 'chemistry',
    title: '原子结构与元素周期律',
    icon: 'atom',
    order: 41,
    summary: '能层能级与轨道、构造原理与能级组、三大排布规则与 Cr/Cu 特例、周期表分区、电离能电负性与半径周期律、元素推断',
    tags: ['物质结构', '元素周期律'],
  },
  {
    slug: 'crystal-properties',
    subject: 'chemistry',
    title: '微粒间作用力与晶体',
    icon: 'box',
    order: 42,
    summary: '晶体四特征与晶胞、均摊法与密度方程、五种作用力、分子/共价/离子/金属四类晶体结构档案、熔沸点决策树',
    tags: ['晶体', '物质结构'],
  },
  {
    slug: 'molecular-structure',
    subject: 'chemistry',
    title: '分子空间结构与物质性质',
    icon: 'hexagon',
    order: 43,
    summary: 'VSEPR 模型与杂化轨道、孤电子对算账、大π键与等电子体、分子极性与相似相溶、手性、配位键与配合物',
    tags: ['分子结构', '物质结构'],
  },
  {
    slug: 'organic-basis',
    subject: 'chemistry',
    title: '研究有机化合物与分类命名',
    icon: 'clipboard-list',
    order: 51,
    summary: '分离提纯三法、四大波谱定结构、碳的成键与八式、同分异构计数、共面共线、官能团分类与系统命名',
    tags: ['有机化学'],
  },
  {
    slug: 'hydrocarbon',
    subject: 'chemistry',
    title: '烃',
    icon: 'flame-kindling',
    order: 52,
    summary: '烷烯炔苯主线：取代加成加聚氧化四类反应、乙炔溴苯制备实验、物理递变与石油炼制、侧链氧化与定位',
    tags: ['有机化学'],
  },
  {
    slug: 'hydrocarbon-derivatives',
    subject: 'chemistry',
    title: '烃的衍生物',
    icon: 'test-tube-diagonal',
    order: 53,
    summary: '卤代烃醇酚醛酮酸酯胺酰胺油脂：水解消去两条路、醇的断键表、酚的三本账、银镜与斐林、酸性序与异构总账',
    tags: ['有机化学'],
  },
  {
    slug: 'polymer-biomolecule',
    subject: 'chemistry',
    title: '生物大分子与合成高分子',
    icon: 'link',
    order: 54,
    summary: '糖类氨基酸蛋白质核酸与合成高分子：葡萄糖五本账、淀粉水解双线检验、肽键脱水与组合数、加聚缩聚对照与链节倒推单体、化学品合理使用',
    tags: ['有机化学'],
  },
  {
    slug: 'organic-inference',
    subject: 'chemistry',
    title: '有机反应类型与合成推断',
    icon: 'route',
    order: 55,
    summary: '推断三要素总枢纽：反应类型判型、条件现象定量三线词典、质量暗号 M±系列、碳骨架增长缩短成环、官能团引入搬移保护基、信息方程式仿写五步',
    tags: ['有机化学'],
  },
];

export const sectionMeta = {
  overview: { label: '概览', icon: 'book-open' },
  mistakes: { label: '易错点', icon: 'triangle-alert' },
  'exam-points': { label: '考点解析', icon: 'target' },
  methods: { label: '解题方法', icon: 'compass' },
  mindmap: { label: '思维导图', icon: 'git-branch' },
  examples: { label: '典型例题', icon: 'file-pen' },
} as const;

export type SectionKey = keyof typeof sectionMeta;

export const difficultyLabel: Record<string, string> = {
  easy: '基础',
  medium: '中等',
  hard: '较难',
};

export const frequencyLabel: Record<string, string> = {
  high: '高频',
  medium: '中频',
  low: '低频',
};

export function getSubject(slug: string): SubjectMeta | undefined {
  return subjectList.find((s) => s.slug === slug);
}

export function getTopicsBySubject(subject: string): TopicMeta[] {
  return topics.filter((t) => t.subject === subject).sort((a, b) => a.order - b.order);
}

export function getTopic(subject: string, slug: string): TopicMeta | undefined {
  return topics.find((t) => t.subject === subject && t.slug === slug);
}

export function sectionHref(subject: string, topic: string, section: SectionKey): string {
  return section === 'overview' ? `/${subject}/${topic}` : `/${subject}/${topic}/${section}`;
}
