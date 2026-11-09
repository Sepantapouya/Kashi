import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

export const ARTICLE_CATEGORIES = ["طراحی", "توسعه", "فارسی‌سازی", "دسترس‌پذیری", "راهنما"] as const;

const articles = defineCollection({
  loader: glob({ pattern: "*.mdx", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string().max(70),
    /** عنوان کامل جستجو، اگر با title فرق دارد */
    seoTitle: z.string().max(62).optional(),
    description: z.string().min(70).max(170),
    /** تاریخ میلادی ISO؛ روی صفحه شمسی نشان داده می‌شود */
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.enum(ARTICLE_CATEGORIES),
    tags: z.array(z.string()).min(1),
    author: z.string().default("سپنتا پویا"),
    coverAlt: z.string(),
    /** آیکون‌های کاشی روی جلد (برای اسکریپت تصویرها) */
    coverIcons: z.array(z.string()).optional(),
    /** مقاله‌های مرتبط (slug) */
    related: z.array(z.string()).default([]),
  }),
});

export const collections = { articles };
