// نسخهٔ CDN برای <script type="module"> بدون ابزار ساخت، با @kashi-ui/persian داخلش.
// فایل اصلی کوچک است و هر بخش (و لوگوی بانک‌ها) فقط وقتی لازم شود از فایل جدای خودش بارگذاری می‌شود.
import { build } from "rolldown";
import { rmSync, statSync, readdirSync } from "node:fs";

rmSync("dist/cdn", { recursive: true, force: true });
await build({
  input: { "kashi-elements": "dist/cdn.js" },
  logLevel: "warn",
  output: { dir: "dist/cdn", format: "esm", minify: true, entryFileNames: "[name].js", chunkFileNames: "[name]-[hash].js" },
});
const main = statSync("dist/cdn/kashi-elements.js").size;
console.log(`elements: dist/cdn/kashi-elements.js ${(main / 1024).toFixed(1)}KB (+ ${readdirSync("dist/cdn").length - 1} lazy chunks)`);
