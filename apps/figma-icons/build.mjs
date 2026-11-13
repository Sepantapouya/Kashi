// پلاگین «آیکون‌های کاشی» برای فیگما: مرور، جست‌وجو، افزودن و خروجی گرفتن از همهٔ آیکون‌های @kashi-ui/icons.
// خروجی: plugin/ (manifest، code.js، ui.html)، فایل zip برای دانلود از سایت و نسخهٔ وب همان پنل برای بیرون از فیگما.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../..");
const { icons, categories, categoryGroups } = await import(join(root, "packages/icons/dist/index.js"));
const version = JSON.parse(readFileSync(join(root, "packages/icons/package.json"), "utf8")).version;

// فقط آیکون‌هایی که پنل برای دکمه‌های خودش لازم دارد باید حتماً وجود داشته باشند
const chromeIcons = ["search", "close", "star", "plus", "download", "image", "copy", "apps", "clock", "sun", "moon", "maximize-diagonal", "minimize-diagonal", "heart"];
for (const n of chromeIcons) if (!icons[n]) throw new Error(`panel icon "${n}" is missing from @kashi-ui/icons`);

const catIds = Object.keys(categories);
const catIndex = Object.fromEntries(catIds.map((c, i) => [c, i]));
const data = {
  version,
  cats: catIds.map((c) => [c, categories[c]]),
  groups: categoryGroups.map((g) => [g.title, g.categories]),
  // [نام، عنوان فارسی، دسته، کلیدواژه‌ها، بدنهٔ SVG، نام کامپوننت React]
  icons: Object.entries(icons).map(([n, i]) => [n, i.title, catIndex[i.category], i.keywords.join(" "), i.body, i.component]),
};

// موتور شش سبک همان render.js پکیج است؛ پنل در iframe مرورگر اجرا می‌شود و نحو تازه مشکلی ندارد
const renderSrc = readFileSync(join(root, "packages/icons/src/render.js"), "utf8").replace(/^export /gm, "");
const render = `var KashiRender = (function () {\n${renderSrc}\nreturn { renderBody, variants };\n})();`;
const fontB64 = readFileSync(join(root, "packages/css/dist/fonts/Vazirmatn.woff2")).toString("base64");

const ui = readFileSync(join(here, "src/ui.html"), "utf8")
  .replace("/*KASHI_FONT*/", () => `@font-face { font-family: "Vazirmatn"; src: url(data:font/woff2;base64,${fontB64}) format("woff2"); font-weight: 100 900; font-display: block; }`)
  .replace("/*KASHI_DATA*/", () => `var DATA = ${JSON.stringify(data)};`)
  .replace("/*KASHI_RENDER*/", () => render);

// کد sandbox فیگما نحو تازه را همیشه اجرا نمی‌کند
const code = readFileSync(join(here, "src/code.js"), "utf8");
if (/\?\.|\?\?|=>/.test(code.replace(/\/\/.*$/gm, ""))) throw new Error("src/code.js must stay ES5-style for the Figma sandbox");

const out = join(here, "plugin");
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "code.js"), `// Kashi Icons — این فایل خودکار ساخته شده است؛ src/ را ویرایش کنید و npm run figma-icons:build بزنید\n${code}`);
writeFileSync(join(out, "ui.html"), ui);
const manifest = JSON.parse(readFileSync(join(here, "manifest.json"), "utf8"));
writeFileSync(join(out, "manifest.json"), JSON.stringify(Object.assign(manifest, { main: "code.js", ui: "ui.html" }), null, 2) + "\n");

// zip بدون فشرده‌سازی با تاریخ ثابت تا خروجی هر بار یکسان باشد
function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function zip(files) {
  const parts = [], central = [];
  let offset = 0;
  for (const [name, dataBuf] of files) {
    const nameBuf = Buffer.from(name), crc = crc32(dataBuf);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0x5b21, 12); local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(dataBuf.length, 18); local.writeUInt32LE(dataBuf.length, 22); local.writeUInt16LE(nameBuf.length, 26);
    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0); cen.writeUInt16LE(20, 4); cen.writeUInt16LE(20, 6); cen.writeUInt16LE(0x0800, 8);
    cen.writeUInt16LE(0x5b21, 14); cen.writeUInt32LE(crc, 16);
    cen.writeUInt32LE(dataBuf.length, 20); cen.writeUInt32LE(dataBuf.length, 24); cen.writeUInt16LE(nameBuf.length, 28); cen.writeUInt32LE(offset, 42);
    parts.push(local, nameBuf, dataBuf);
    central.push(cen, nameBuf);
    offset += 30 + nameBuf.length + dataBuf.length;
  }
  const cenBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(cenBuf.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, cenBuf, end]);
}
const downloads = join(root, "apps/docs/public/downloads");
mkdirSync(downloads, { recursive: true });
writeFileSync(join(downloads, "kashi-icons-figma-plugin.zip"), zip(["manifest.json", "code.js", "ui.html"].map((f) => [`kashi-icons-figma-plugin/${f}`, readFileSync(join(out, f))])));
// همان پنل به‌صورت صفحهٔ وب: دانلود SVG و PNG و کپی کد بیرون از فیگما
writeFileSync(join(root, "apps/docs/public/icon-exporter.html"), ui);

console.log(`figma-icons: ${data.icons.length} icons, ${data.cats.length} categories, ui ${(ui.length / 1024 / 1024).toFixed(1)} MB`);
