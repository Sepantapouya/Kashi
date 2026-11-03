import type { APIRoute } from "astro";
import { itemJson, registryItems } from "../../data/registry";

// فهرست کامل رجیستری shadcn کاشی
export const GET: APIRoute = ({ site, url }) => {
  // تست مصرف‌کننده (scripts/consumer-test.mjs) رجیستری را روی localhost سرو می‌کند
  const origin = import.meta.env.DEV ? url.origin : (process.env.KASHI_REGISTRY_ORIGIN ?? site!.origin);
  const body = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "kashi",
    homepage: "https://kashi.sepantapouya.com",
    items: registryItems(origin).map((it) => {
      const { files, ...rest } = itemJson(it);
      return { ...rest, files: files.map(({ content: _c, ...f }) => f) };
    }),
  };
  return new Response(JSON.stringify(body, null, 2), { headers: { "Content-Type": "application/json; charset=utf-8" } });
};
