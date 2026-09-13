import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const knowledge = defineCollection({
  loader: glob({ base: './src/content', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    topic: z.string(),
    category: z.enum([
      'overview',
      'mistakes',
      'exam-points',
      'methods',
      'mindmap',
      'examples',
    ]),
    order: z.number().default(0),
    summary: z.string().default(''),
    tags: z.array(z.string()).default([]),
    difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
    examFrequency: z.enum(['high', 'medium', 'low']).default('medium'),
    updated: z.string().default(''),
  }),
});

export const collections = { knowledge };
