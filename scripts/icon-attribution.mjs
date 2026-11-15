import { readFileSync } from "node:fs";

const iconFile = (name) => new URL(`../packages/icons/${name}`, import.meta.url);
const notices = ["LICENSE", "THIRD-PARTY-NOTICES.md", "Tabler-MIT.txt", "Iconoir-MIT.txt", "Vazirmatn-OFL.txt"];
const records = [...notices, "general-sources.json", "brand-sources.json"];

// مجوزها همراه فایل‌های مستقل هم می‌مانند؛ دانلود پلاگین به نصب npm وابسته نیست.
export const iconAttributionText = notices.map(name => `${name}\n\n${readFileSync(iconFile(name), "utf8").replace(/[ \t]+$/gm, "")}`).join("\n\n")
  + "\n\nSource attribution tables: https://github.com/Sepantapouya/Kashi/tree/main/packages/icons\n";
export const iconHtmlNotice = `<!--\n${iconAttributionText.replaceAll("-->", "--&gt;")}\n-->\n`;
export function withIconHtmlNotice(html) {
  // charset باید در ابتدای فایل بماند تا متن فارسی پیش از اعلان طولانی مجوز شناخته شود.
  const charset = /<meta\s+charset\s*=\s*["']?utf-8["']?\s*\/?>/i;
  if (!charset.test(html)) throw new Error("Standalone icon HTML needs an early UTF-8 charset declaration");
  return html.replace(charset, tag => `${tag}\n${iconHtmlNotice}`);
}
export const iconJsNotice = `/*\n${iconAttributionText.replaceAll("*/", "* /")}\n*/\n`;
export const iconLicenseZipEntries = (prefix) => records.map(name => [`${prefix}/licenses/${name}`, readFileSync(iconFile(name))]);
