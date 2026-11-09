import type { APIRoute } from "astro";
import { getArticles } from "../../lib/articles";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** خوراک RSS مقاله‌ها */
export const GET: APIRoute = async ({ site }) => {
  const base = site!.href.replace(/\/$/, "");
  const items = (await getArticles()).map((a) => `
    <item>
      <title>${esc(a.data.title)}</title>
      <link>${base}/articles/${a.id}/</link>
      <guid isPermaLink="true">${base}/articles/${a.id}/</guid>
      <description>${esc(a.data.description)}</description>
      <category>${esc(a.data.category)}</category>
      <pubDate>${a.data.date.toUTCString()}</pubDate>
      <enclosure url="${base}/articles/${a.id}/cover.jpg" type="image/jpeg" length="0" />
    </item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>مقاله‌های کاشی</title>
    <link>${base}/articles/</link>
    <atom:link href="${base}/articles/rss.xml" rel="self" type="application/rss+xml" />
    <description>راهنمای عملی طراحی و توسعهٔ رابط کاربری فارسی</description>
    <language>fa-IR</language>${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};
