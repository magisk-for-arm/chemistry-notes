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
  return section === 'overview' ? `/${subject}/${topic}/` : `/${subject}/${topic}/${section}`;
}
