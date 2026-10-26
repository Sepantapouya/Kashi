import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";

export default defineConfig({
  integrations: [mdx(), react()],
  devToolbar: { enabled: false },
  markdown: {
    shikiConfig: {
      // دو تم؛ رنگ نهایی با data-theme در CSS انتخاب می‌شود
      themes: { light: "github-light", dark: "github-dark-default" },
      defaultColor: false,
    },
  },
});
