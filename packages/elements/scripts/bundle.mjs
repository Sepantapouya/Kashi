// نسخهٔ CDN: یک فایل ES module با @kashi-ui/persian داخلش، برای <script type="module"> بدون ابزار ساخت.
// لوگوی بانک‌ها در فایل جدا می‌ماند و فقط وقتی شمارهٔ کارت یا شبا وارد شود بارگذاری می‌شود.
import { build } from "rolldown";
import { rmSync, statSync, readdirSync } from "node:fs";

rmSync("dist/cdn", { recursive: true, force: true });
await build({
  input: { "kashi-elements": "dist/index.js" },
  logLevel: "warn",
  output: { dir: "dist/cdn", format: "esm", minify: true, entryFileNames: "[name].js", chunkFileNames: "bank-logos-[hash].js" },
});
const main = statSync("dist/cdn/kashi-elements.js").size;
console.log(`elements: dist/cdn/kashi-elements.js ${(main / 1024).toFixed(1)}KB (+ ${readdirSync("dist/cdn").length - 1} lazy chunk)`);
