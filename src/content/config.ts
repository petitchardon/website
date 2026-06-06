import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slugs: z.object({
      fr: z.string(),
      en: z.string(),
    }),
    tag: z.string().optional(),
    description: z.object({
      fr: z.string(),
      en: z.string(),
    }),
    cover: z.string(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects };
