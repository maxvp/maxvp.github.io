import { defineCollection, z } from 'astro:content';

const portfolio = defineCollection({
    type: 'content',
    schema: ({ image }) => z.object({
        title: z.string(),
        date: z.string().or(z.date()).transform((val) => new Date(val)),
        client: z.string().optional(),
        clientUrl: z.string().optional(),
        clientClass: z.string().optional(),
        url: z.string().optional(),
        featured: z.boolean().default(false),
        image: image().optional(),
        imageAlt: z.string().optional(),
        tags: z.array(z.string()).default([]),
    }),
});

const blog = defineCollection({
    type: 'content',
    schema: ({ image }) => z.object({
        title: z.string(),
        description: z.string().optional(),
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        heroImage: image().optional(),
    }),
});

export const collections = { portfolio, blog };
