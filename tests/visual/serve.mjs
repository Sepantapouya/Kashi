// سرور ایستای خروجی سایت (apps/docs/dist) برای تست تصویری؛ بدون وابستگی و هم‌پروسه تا Playwright بتواند آن را ببندد
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const ROOT = join(process.cwd(), "apps/docs/dist");
const PORT = Number(process.argv[2] ?? 4417);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".json": "application/json", ".txt": "text/plain; charset=utf-8", ".ico": "image/x-icon", ".webp": "image/webp", ".jpg": "image/jpeg" };

createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = normalize(join(ROOT, url));
  if (!file.startsWith(ROOT)) return res.writeHead(403).end();
  try {
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" }).end(await readFile(file));
  } catch {
    res.writeHead(404, { "content-type": "text/html; charset=utf-8" }).end(await readFile(join(ROOT, "404.html")).catch(() => "404"));
  }
}).listen(PORT, "127.0.0.1", () => console.log(`visual: serving ${ROOT} on http://localhost:${PORT}`));
