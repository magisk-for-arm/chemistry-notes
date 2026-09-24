export interface SubjectMeta {
  slug: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export interface TopicMeta {
  slug: string;
  subject: string;
  title: string;
  icon: string;
  order: number;
  summary: string;
  tags: string[];
}

export const subjectList: SubjectMeta[] = [
  {
    slug: 'chemistry',
    title: '化学',
    description: '高中化学要点 · 易错点 · 考点 · 解题方法',
    icon: '⚗️',
    order: 1,
  },
];

export const topics: TopicMeta[] = [
  {
    slug: 'avogadro',
    subject: 'chemistry',
    title: '阿伏加德罗常数',
    icon: 'NA',
    order: 1,
    summary: '物质的量计算的核心，高考选择题的高频陷阱区',
    tags: ['物质的量', '气体摩尔体积', '氧化还原'],
  },
  {
    slug: 'matter-classification',
    subject: 'chemistry',
    title: '物质的组成与分类',
    icon: '🧩',
    order: 11,
    summary: '分类体系、电解质、胶体与化学常识，STSE 题的地基',
    tags: ['物质的分类', '胶体', 'STSE'],
  },
  {
    slug: 'redox',
    subject: 'chemistry',
    title: '氧化还原反应',
    icon: '⚡',
    order: 12,
    summary: '概念网、强弱规律、配平流程与电子守恒速算',
    tags: ['氧化还原', '计算'],
  },
  {
    slug: 'ion-reaction',
    subject: 'chemistry',
    title: '离子反应',
    icon: '💧',
    order: 13,
    summary: '离子方程式书写与正误判断、离子共存与检验推断',
    tags: ['离子反应'],
  },
  {
    slug: 'metal-sodium',
    subject: 'chemistry',
    title: '钠及其化合物',
    icon: '🧂',
    order: 21,
    summary: '钠三角、过氧化钠记账、碳酸钠与碳酸氢钠对比及焰色反应',
    tags: ['金属元素'],
  },
  {
    slug: 'metal-iron',
    subject: 'chemistry',
    title: '铁及其化合物',
    icon: '🧲',
    order: 22,
    summary: '铁三角、硝酸三档配比、Fe(OH)₂ 防氧化与 Fe²⁺/Fe³⁺ 检验，附铜的联动',
    tags: ['金属元素', '氧化还原'],
  },
  {
    slug: 'metal-aluminum',
    subject: 'chemistry',
    title: '铝及其化合物',
    icon: '🥫',
    order: 23,
    summary: '铝三角与互滴图像、氢氧化铝制备路线评价，附镁、海水提镁与金属冶炼',
    tags: ['金属元素', '离子反应'],
  },
];

export const sectionMeta = {
  overview: { label: '概览', icon: '📖' },
  mistakes: { label: '易错点', icon: '⚠️' },
  'exam-points': { label: '考点解析', icon: '🎯' },
  methods: { label: '解题方法', icon: '🧭' },
  mindmap: { label: '思维导图', icon: '🗺️' },
  examples: { label: '典型例题', icon: '📝' },
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
