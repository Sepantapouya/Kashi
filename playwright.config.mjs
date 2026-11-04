// تست تصویری: از نمونه‌های هر صفحهٔ کامپوننت در سایت مستندات (تم روشن و تیره) عکس گرفته و با عکس ذخیره‌شده مقایسه می‌شود.
//   npm run test:visual           مقایسه (اول سایت را بسازید: npm run docs:build)
//   npm run test:visual:update    عکس‌های مرجع تازه، وقتی تغییر ظاهری عمدی است
// عکس‌ها به سیستم‌عامل وابسته‌اند (فونت و رندر)؛ برای هر سیستم جدا ذخیره می‌شوند.
import { defineConfig } from "@playwright/test";

// پورت جدا از سرورهای توسعه؛ اگر اشغال باشد تست خطا می‌دهد (به سرور دیگری وصل نمی‌شود)
const PORT = 4417;
export default defineConfig({
  testDir: "tests/visual",
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
    { name: "light", use: { colorScheme: "light" } },
    { name: "dark", use: { colorScheme: "dark" } },
  ],
  webServer: {
    command: `node tests/visual/serve.mjs ${PORT}`,
    url: `http://127.0.0.1:${PORT}/docs/`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
