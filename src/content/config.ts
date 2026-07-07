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
    services: z.array(z.string()).default([]),
    challenge: z.object({ fr: z.string(), en: z.string() }).optional(),
    outcome: z.object({ fr: z.string(), en: z.string() }).optional(),
    gallery: z.array(z.object({
      src: z.string(),
      alt: z.object({ fr: z.string(), en: z.string() }),
    })).default([]),
  }),
});

export const collections = { projects };
