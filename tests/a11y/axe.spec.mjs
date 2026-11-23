// تست دسترس‌پذیری خودکار با axe-core: هر نمونهٔ زندهٔ صفحه‌های کامپوننت (.demo__preview) و صفحهٔ حالت‌ها
// در سه حالت بررسی می‌شود: روشن، تیره، و تیره با کنتراست بالا (prefers-contrast: more).
//   npm run test:a11y      (اول سایت را بسازید: npm run docs:build)
// معیار: WCAG 2.2 سطح A و AA. فقط خود نمونه‌ها بررسی می‌شوند، نه سربرگ و منوی سایت مستندات.
// مشکل شناخته‌شده‌ای که هنوز درست نشده در known-issues.mjs ثبت می‌شود؛ هر خطای تازه تست را می‌شکند.
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { KNOWN } from "./known-issues.mjs";

const DIST = "apps/docs/dist/docs";
const pages = ["components", "persian"].flatMap((section) =>
  existsSync(join(DIST, section)) ? readdirSync(join(DIST, section), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => `${section}/${d.name}`) : [],
);

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test.beforeEach(async ({ page }, info) => {
  await page.clock.setFixedTime(new Date("2026-11-07T10:00:00+03:30"));
  const theme = info.project.metadata.theme;
  await page.addInitScript((t) => {
    try {
      localStorage.setItem("kashi-theme", t);
    } catch {}
  }, theme);
  if (info.project.metadata.contrast) await page.emulateMedia({ contrast: "more" });
});

/** خطاهای axe منهای موارد شناخته‌شدهٔ همان صفحه؛ خروجی خوانا برای پیام شکست */
function report(path, violations, project) {
  const known = KNOWN[path] ?? [];
  const fresh = violations
    .map((v) => ({ ...v, nodes: v.nodes.filter((n) => !known.some((k) => k.rule === v.id && (!k.target || n.target.join(" ").includes(k.target)) && (!k.projects || k.projects.includes(project)))) }))
    .filter((v) => v.nodes.length);
  return fresh.map((v) => `${v.id} (${v.impact}): ${v.help}\n${v.nodes.slice(0, 5).map((n) => `    ${n.target.join(" ")}\n      ${n.failureSummary?.split("\n").slice(1, 3).join(" ").trim()}`).join("\n")}${v.nodes.length > 5 ? `\n    …و ${v.nodes.length - 5} مورد دیگر` : ""}\n    ${v.helpUrl}`);
}

for (const path of pages) {
  test(path, async ({ page }, info) => {
    await page.goto(`/docs/${path}/`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    if (!(await page.locator(".demo__preview").count())) test.skip(true, "no live examples");
    const { violations } = await new AxeBuilder({ page }).include(".demo__preview").withTags(TAGS).analyze();
    const problems = report(path, violations, info.project.name);
    expect(problems, `\n${problems.join("\n\n")}\n`).toEqual([]);
  });
}

test("states", async ({ page }, info) => {
  await page.goto("/test/states/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const { violations } = await new AxeBuilder({ page }).include("[data-visual]").withTags(TAGS).analyze();
  const problems = report("states", violations, info.project.name);
  expect(problems, `\n${problems.join("\n\n")}\n`).toEqual([]);
});
