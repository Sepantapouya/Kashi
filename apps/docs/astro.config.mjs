import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://kashi.sepantapouya.com",
  integrations: [mdx(), react()],
  devToolbar: { enabled: false },
  // فیلدهای فارسی در یک صفحه (PersianInput) جمع شده‌اند؛ نشانی‌های قدیمی به بخش همان نوع می‌روند
  redirects: {
    "/docs/persian/national-id/": "/docs/persian/input/#national-id",
    "/docs/persian/legal-id/": "/docs/persian/input/#legal-id",
    "/docs/persian/mobile/": "/docs/persian/input/#mobile",
    "/docs/persian/landline/": "/docs/persian/input/#landline",
    "/docs/persian/card-number/": "/docs/persian/input/#card",
    "/docs/persian/iban/": "/docs/persian/input/#iban",
    "/docs/persian/price/": "/docs/persian/input/#price",
    "/docs/persian/postal-code/": "/docs/persian/input/#postal",
    "/docs/persian/time/": "/docs/persian/input/#time",
    "/docs/persian/plate/": "/docs/persian/input/#plate",
    "/docs/persian/keyboard-fix/": "/docs/persian/input/#text",
  },
  markdown: {
    shikiConfig: {
      // دو تم؛ رنگ نهایی با data-theme در CSS انتخاب می‌شود
      themes: { light: "github-light", dark: "github-dark-default" },
      defaultColor: false,
    },
  },
});
