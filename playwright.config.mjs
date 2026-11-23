// همهٔ تست‌های مرورگری روی خروجی ساخته‌شدهٔ سایت مستندات (اول: npm run docs:build)
//   npm run test:visual           تست تصویری: از نمونه‌های هر صفحه در تم روشن و تیره عکس گرفته و با عکس ذخیره‌شده مقایسه می‌شود
//   npm run test:visual:update    عکس‌های مرجع تازه، وقتی تغییر ظاهری عمدی است
//   npm run test:a11y             axe روی همهٔ نمونه‌ها در روشن، تیره و کنتراست بالا (tests/a11y)
//   npm run test:interaction      صفحه‌کلید، تلهٔ فوکوس و رفتار کامپوننت‌ها (tests/interaction)
// عکس‌ها به سیستم‌عامل وابسته‌اند (فونت و رندر)؛ برای هر سیستم جدا ذخیره می‌شوند.
import { defineConfig } from "@playwright/test";

// پورت جدا از سرورهای توسعه؛ اگر اشغال باشد تست خطا می‌دهد (به سرور دیگری وصل نمی‌شود)
const PORT = 4417;
export default defineConfig({
  testDir: "tests",
  snapshotPathTemplate: "tests/visual/__screenshots__/{platform}/{projectName}/{arg}{ext}",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  reporter: [["list"], ["html", { outputFolder: "tests/visual/report", open: "never" }]],
  outputDir: "tests/visual/results",
  timeout: 60_000,
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: "disabled", caret: "hide", scale: "css" } },
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    locale: "fa-IR",
    timezoneId: "Asia/Tehran",
    // روی کامپیوتر خودتان از Chrome نصب‌شده؛ در CI مرورگر Playwright
    channel: process.env.CI ? undefined : "chrome",
  },
  projects: [
    { name: "light", testDir: "tests/visual", use: { colorScheme: "light" } },
    { name: "dark", testDir: "tests/visual", use: { colorScheme: "dark" } },
    { name: "a11y-light", testDir: "tests/a11y", metadata: { theme: "light" }, use: { colorScheme: "light", reducedMotion: "reduce" } },
    { name: "a11y-dark", testDir: "tests/a11y", metadata: { theme: "dark" }, use: { colorScheme: "dark", reducedMotion: "reduce" } },
    { name: "a11y-contrast", testDir: "tests/a11y", metadata: { theme: "dark", contrast: true }, use: { colorScheme: "dark", reducedMotion: "reduce" } },
    { name: "interaction", testDir: "tests/interaction", use: { colorScheme: "dark", reducedMotion: "reduce" } },
  ],
  webServer: {
    command: `node tests/visual/serve.mjs ${PORT}`,
    url: `http://127.0.0.1:${PORT}/docs/`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
