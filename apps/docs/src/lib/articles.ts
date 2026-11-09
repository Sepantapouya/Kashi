import { getCollection, type CollectionEntry } from "astro:content";
import { formatJalali } from "@kashi-ui/persian";

export type Article = CollectionEntry<"articles">;

/** زمان مطالعه: حدود ۱۸۰ کلمهٔ فارسی در دقیقه؛ کد و برچسب‌های MDX شمرده نمی‌شوند */
export function readingMinutes(body = "") {
  const text = body.replace(/```[\s\S]*?```/g, " ").replace(/<[^>]+>/g, " ").replace(/[#*_`>\[\]()!-]/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 180));
}

export const faDate = (d: Date) => formatJalali(d, { style: "long" });
export const isoDay = (d: Date) => d.toISOString().slice(0, 10);

export async function getArticles() {
  const all = await getCollection("articles");
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.data.title.localeCompare(b.data.title, "fa"));
}
