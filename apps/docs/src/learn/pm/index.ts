// فهرست درس‌های دورهٔ مدیریت محصول؛ ترتیب از پیشوند نام فایل (01-…) می‌آید
import type { AstroComponentFactory } from "astro/runtime/server/index.js";

interface Mod { frontmatter: { title: string; summary: string; minutes: number }; Content: AstroComponentFactory }
const mods = import.meta.glob<Mod>("./*.mdx", { eager: true });
const raws = import.meta.glob<string>("./*.mdx", { eager: true, query: "?raw", import: "default" });

export const lessons = Object.keys(mods).sort().map((path, i) => {
  const { frontmatter, Content } = mods[path];
  const slug = path.replace(/^\.\/\d+-/, "").replace(/\.mdx$/, "");
  return {
    slug,
    n: i + 1,
    href: `/learn/pm/${slug}/`,
    title: frontmatter.title,
    summary: frontmatter.summary,
    minutes: frontmatter.minutes,
    actions: (raws[path].match(/<Act\s/g) ?? []).length,
    Content,
  };
});

export type Lesson = (typeof lessons)[number];
export const fa = (n: number) => n.toLocaleString("fa-IR");
export const fa2 = (n: number) => fa(n).padStart(2, "۰");
export const totalMinutes = lessons.reduce((s, l) => s + l.minutes, 0);
