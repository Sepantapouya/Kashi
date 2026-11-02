import type { APIRoute, GetStaticPaths } from "astro";
import { itemJson, registryItems } from "../../data/registry";

// هر آیتم رجیستری shadcn: npx shadcn@latest add https://kashi.sepantapouya.com/r/<name>.json
export const getStaticPaths: GetStaticPaths = () => registryItems("").map((it) => ({ params: { name: it.name } }));

export const GET: APIRoute = ({ params, site, url }) => {
  const origin = import.meta.env.DEV ? url.origin : site!.origin;
  const item = registryItems(origin).find((it) => it.name === params.name)!;
  return new Response(JSON.stringify(itemJson(item), null, 2), { headers: { "Content-Type": "application/json; charset=utf-8" } });
};
