// فقط موقع توسعه (astro dev): همان دروازهٔ رمزدار دوره جلوی سرور Vite، تا رفتار محلی مثل سایت واقعی باشد.
// در سایت واقعی middleware.ts ورسل در ریشهٔ apps/docs همین کار را می‌کند؛ این‌جا فقط آینهٔ آن است.
// رمز محلی را در apps/docs/.env بگذارید (KASHI_PM_PASSWORD=…)؛ این فایل در git نیست.
import type { AstroIntegration } from "astro";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { pmGate } from "./pm-gate";

export function pmGateDev(): AstroIntegration {
  let root = process.cwd();
  return {
    name: "kashi-pm-gate-dev",
    hooks: {
      "astro:config:setup": ({ config }) => { root = fileURLToPath(config.root); },
      "astro:server:setup": ({ server }) => {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith("/learn")) return next();
          try {
            const password = process.env.KASHI_PM_PASSWORD ?? loadEnv("development", root, "KASHI_").KASHI_PM_PASSWORD;
            const headers = new Headers();
            for (const [k, v] of Object.entries(req.headers)) if (v != null) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
            const chunks: Buffer[] = [];
            if (req.method === "POST") for await (const c of req) chunks.push(c as Buffer);
            const request = new Request(`http://${req.headers.host ?? "localhost"}${req.url}`, {
              method: req.method,
              headers,
              body: chunks.length ? Buffer.concat(chunks) : undefined,
            });
            const out = await pmGate(request, password);
            if (!out) return next();
            res.statusCode = out.status;
            out.headers.forEach((v, k) => { if (k !== "set-cookie") res.setHeader(k, v); });
            const cookies = out.headers.getSetCookie();
            if (cookies.length) res.setHeader("set-cookie", cookies);
            res.end(Buffer.from(await out.arrayBuffer()));
          } catch (err) {
            next(err);
          }
        });
      },
    },
  };
}
