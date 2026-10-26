// منبع واحد حقیقت برای همهٔ توکن‌های کاشی.
// build.mjs از روی این فایل CSS Variables، JSON و JS می‌سازد.

/** رنگ‌های پایه — الهام‌گرفته از کاشی‌کاری و رنگ‌های ایرانی */
export const palette = {
  // فیروزه‌ای — رنگ اصلی برند
  firoozeh: {
    50: "#e6fbf8", 100: "#c2f4ee", 200: "#8ce9df", 300: "#4fd8cb", 400: "#22c2b4",
    500: "#0fa89b", 600: "#0b8077", 700: "#0a6b65", 800: "#0d5551", 900: "#0f4644", 950: "#042a29",
  },
  // لاجوردی — اطلاعات و لینک
  lajvard: {
    50: "#eef3ff", 100: "#dbe5ff", 200: "#bfd0ff", 300: "#93b0ff", 400: "#6185fd",
    500: "#3d5ef8", 600: "#2740ed", 700: "#1f30d9", 800: "#2029b0", 900: "#20298b", 950: "#181b54",
  },
  // زعفرانی — هشدار
  zafaran: {
    50: "#fff8eb", 100: "#ffecc6", 200: "#ffd788", 300: "#ffbd4a", 400: "#ffa520",
    500: "#f98307", 600: "#dd5e02", 700: "#b73e06", 800: "#94300c", 900: "#7a280d", 950: "#461202",
  },
  // اناری — خطر و خطا
  anar: {
    50: "#fff1f2", 100: "#ffe0e2", 200: "#ffc7cb", 300: "#ffa0a6", 400: "#ff6972",
    500: "#f83b47", 600: "#e51d2a", 700: "#c11420", 800: "#a0141e", 900: "#841820", 950: "#48070b",
  },
  // پسته‌ای — موفقیت
  pesteh: {
    50: "#f3faeb", 100: "#e4f4d3", 200: "#cbeaac", 300: "#a9db7b", 400: "#89c951",
    500: "#6aae33", 600: "#518b25", 700: "#3f6a21", 800: "#35551f", 900: "#2e491e", 950: "#15270c",
  },
  // شب — خاکستری‌های کمی آبی برای پس‌زمینه و متن
  // ۴۵۰ و ۵۵۰ کم‌رنگ‌ترین خاکستری‌هایی‌اند که هنوز کنتراست ۳:۱ حاشیهٔ فیلد را دارند (روشن و تیره)
  shab: {
    0: "#ffffff", 50: "#f6f7f9", 100: "#eceef2", 200: "#d5d9e2", 300: "#b1b9c9", 400: "#8792ab",
    450: "#848fa7", 500: "#687491", 550: "#5a637a", 600: "#535d78", 700: "#444c62", 800: "#2a2f3d",
    850: "#1e222c", 900: "#161921", 925: "#111319", 950: "#0d0f14", 1000: "#08090c",
  },
};

/** پیچ‌های سراسری — با تغییر یک عدد کل ظاهر عوض می‌شود */
export const knobs = {
  // گردی گوشه‌ها
  "radius-factor": "1",
  // تراکم: 0.875 = فشرده (مثل Polaris)، 1 = عادی، 1.125 = جادار
  "density": "1",
  // ضریب اندازهٔ همهٔ متن‌ها؛ برای فونت‌هایی که درشت‌تر یا ریزتر از وزیرمتن دیده می‌شوند
  "text-scale": "1",
};

/** فاصله‌ها — مضرب ۴ پیکسل */
export const space = {
  0: "0", px: "1px", 0.5: "0.125rem", 1: "0.25rem", 1.5: "0.375rem", 2: "0.5rem", 3: "0.75rem",
  4: "1rem", 5: "1.25rem", 6: "1.5rem", 8: "2rem", 10: "2.5rem", 12: "3rem", 16: "4rem",
  20: "5rem", 24: "6rem",
};

// همهٔ گوشه‌ها در --k-radius-factor ضرب می‌شوند: 0 = تیز، 1 = پیش‌فرض، 2 = خیلی گرد
const r = (rem) => `calc(${rem}rem * var(--k-radius-factor))`;
export const radius = {
  none: "0", sm: r(0.25), md: r(0.5), lg: r(0.75), xl: r(1), "2xl": r(1.5), full: "9999px",
};

const t = (rem) => `calc(${rem}rem * var(--k-text-scale))`;

export const font = {
  family: {
    sans: '"Vazirmatn", "Vazir", Tahoma, system-ui, sans-serif',
    // فونت عنوان‌ها؛ پیش‌فرض همان فونت متن
    display: "var(--k-font-sans)",
    // وزیرمتن به‌عنوان جایگزین تا متن فارسی داخل کد هم یکدست باشد
    mono: 'ui-monospace, "SF Mono", Menlo, Consolas, "Vazirmatn", monospace',
  },
  // متن فارسی در اندازه‌های یکسان کمی کوچک‌تر از لاتین دیده می‌شود؛ پایه ۱۵px است
  size: {
    xs: t(0.75), sm: t(0.875), md: t(0.9375), lg: t(1.0625), xl: t(1.25),
    "2xl": t(1.5), "3xl": t(1.875), "4xl": t(2.25), "5xl": t(3), "6xl": t(3.75),
  },
  weight: { light: "300", regular: "400", medium: "500", semibold: "600", bold: "700", black: "900" },
  // حروف فارسی نقطه و دندانه دارند و به ارتفاع خط بیشتری نیاز دارند
  leading: { tight: "1.35", normal: "1.75", relaxed: "2" },
};

// سایه‌ها به سبک Untitled UI (نرم و لایه‌ای)
export const shadow = {
  xs: "0 1px 2px rgb(10 13 18 / 0.05)",
  sm: "0 1px 3px rgb(10 13 18 / 0.1), 0 1px 2px -1px rgb(10 13 18 / 0.1)",
  md: "0 4px 6px -1px rgb(10 13 18 / 0.1), 0 2px 4px -2px rgb(10 13 18 / 0.06)",
  lg: "0 12px 16px -4px rgb(10 13 18 / 0.08), 0 4px 6px -2px rgb(10 13 18 / 0.03)",
  xl: "0 20px 24px -4px rgb(10 13 18 / 0.08), 0 8px 8px -4px rgb(10 13 18 / 0.03)",
  "2xl": "0 24px 48px -12px rgb(10 13 18 / 0.18)",
};

export const motion = {
  duration: { fast: "120ms", normal: "200ms", slow: "320ms" },
  easing: { standard: "cubic-bezier(0.2, 0, 0, 1)", emphasized: "cubic-bezier(0.3, 0, 0, 1.3)" },
};

export const zIndex = { dropdown: "1000", sticky: "1100", overlay: "1300", modal: "1400", toast: "1500" };

const p = (scale, step) => `var(--k-${scale}-${String(step).replace(".", "_")})`;

/** توکن‌های معنایی — کامپوننت‌ها فقط از این‌ها استفاده می‌کنند، نه از palette.
 *  نام‌گذاری به سبک Untitled UI: primary = پررنگ‌ترین، tertiary = کم‌رنگ‌تر.
 *  رویکرد neutral-first: خاکستری‌ها صفحه را می‌سازند، رنگ برند فقط برای تأکید. */
export const themes = {
  dark: {
    // پس‌زمینه
    "bg-primary": p("shab", 1000),
    "bg-secondary": p("shab", 950),
    "bg-tertiary": p("shab", 900),
    "bg-elevated": p("shab", 925),
    "bg-hover": "rgb(255 255 255 / 0.05)",
    "bg-active": "rgb(255 255 255 / 0.08)",
    "bg-brand": p("brand", 400),
    "bg-brand-hover": p("brand", 300),
    "bg-brand-subtle": "color-mix(in srgb, var(--k-brand-500) 14%, transparent)",
    "bg-error": p("anar", 600),
    "bg-error-hover": p("anar", 700),
    "bg-error-subtle": "rgb(248 59 71 / 0.14)",
    "bg-warning-subtle": "rgb(249 131 7 / 0.14)",
    "bg-success-subtle": "rgb(106 174 51 / 0.14)",
    "bg-info-subtle": "rgb(61 94 248 / 0.16)",
    // متن
    "text-primary": p("shab", 50),
    "text-secondary": p("shab", 200),
    "text-tertiary": p("shab", 400),
    "text-quaternary": p("shab", 500),
    "text-on-brand": p("shab", 1000),
    "text-on-error": p("shab", 0),
    "text-brand": p("brand", 300),
    "text-error": p("anar", 400),
    "text-warning": p("zafaran", 400),
    "text-success": p("pesteh", 400),
    "text-info": p("lajvard", 300),
    // حاشیه
    "border-primary": p("shab", 700),
    "border-secondary": p("shab", 800),
    "border-brand": p("brand", 400),
    // حاشیهٔ فیلدها، چک‌باکس و سوییچ خاموش — حداقل ۳:۱ (WCAG 1.4.11)
    "border-input": p("shab", 550),
    "border-error": p("anar", 400),
    // حلقهٔ فوکوس نرم و پهن (Untitled UI)
    "ring-brand": "0 0 0 4px color-mix(in srgb, var(--k-brand-400) 28%, transparent)",
    "ring-error": "0 0 0 4px rgb(248 59 71 / 0.28)",
    // سایهٔ اسکئومورفیک دکمه‌ها و فیلدها (Untitled UI)
    "shadow-skeuomorphic": "inset 0 0 0 1px rgb(0 0 0 / 0.2), inset 0 -2px 0 rgb(0 0 0 / 0.12)",
    // خط روشن بالای سطوح برجسته در تم تیره؛ حس عمق می‌دهد
    "highlight": "inset 0 1px 0 rgb(255 255 255 / 0.05)",
    // سایه‌ها در تیره باید پررنگ‌تر باشند تا دیده شوند
    "shadow-xs": "0 1px 2px rgb(0 0 0 / 0.4)",
    "shadow-sm": "0 1px 3px rgb(0 0 0 / 0.45), 0 1px 2px -1px rgb(0 0 0 / 0.4)",
    "shadow-md": "0 4px 8px -2px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.35)",
    "shadow-lg": "0 12px 24px -4px rgb(0 0 0 / 0.55), 0 4px 8px -4px rgb(0 0 0 / 0.35)",
    "shadow-xl": "0 20px 32px -6px rgb(0 0 0 / 0.6), 0 8px 12px -6px rgb(0 0 0 / 0.4)",
    "shadow-2xl": "0 28px 56px -12px rgb(0 0 0 / 0.7)",
  },
  light: {
    "bg-primary": p("shab", 0),
    "bg-secondary": p("shab", 50),
    "bg-tertiary": p("shab", 100),
    "bg-elevated": p("shab", 0),
    "bg-hover": p("shab", 50),
    "bg-active": p("shab", 100),
    "bg-brand": p("brand", 600),
    "bg-brand-hover": p("brand", 700),
    "bg-brand-subtle": p("brand", 50),
    "bg-error": p("anar", 600),
    "bg-error-hover": p("anar", 700),
    "bg-error-subtle": p("anar", 50),
    "bg-warning-subtle": p("zafaran", 50),
    "bg-success-subtle": p("pesteh", 50),
    "bg-info-subtle": p("lajvard", 50),
    "text-primary": p("shab", 950),
    "text-secondary": p("shab", 700),
    "text-tertiary": p("shab", 600),
    "text-quaternary": p("shab", 500),
    "text-on-brand": p("shab", 0),
    "text-on-error": p("shab", 0),
    "text-brand": p("brand", 700),
    "text-error": p("anar", 700),
    "text-warning": p("zafaran", 700),
    "text-success": p("pesteh", 700),
    "text-info": p("lajvard", 700),
    "border-primary": p("shab", 300),
    "border-secondary": p("shab", 200),
    "border-brand": p("brand", 600),
    "border-input": p("shab", 450),
    "border-error": p("anar", 500),
    "ring-brand": "0 0 0 4px color-mix(in srgb, var(--k-brand-500) 20%, transparent)",
    "ring-error": "0 0 0 4px rgb(229 29 42 / 0.2)",
    "shadow-skeuomorphic": "inset 0 0 0 1px rgb(10 13 18 / 0.18), inset 0 -2px 0 rgb(10 13 18 / 0.05)",
    "highlight": "0 0 #0000",
    // بازگرداندن سایه‌های روشن برای زیرشاخه‌هایی که داخل تم تیره روشن شده‌اند
    "shadow-xs": "0 1px 2px rgb(10 13 18 / 0.05)",
    "shadow-sm": "0 1px 3px rgb(10 13 18 / 0.1), 0 1px 2px -1px rgb(10 13 18 / 0.1)",
    "shadow-md": "0 4px 6px -1px rgb(10 13 18 / 0.1), 0 2px 4px -2px rgb(10 13 18 / 0.06)",
    "shadow-lg": "0 12px 16px -4px rgb(10 13 18 / 0.08), 0 4px 6px -2px rgb(10 13 18 / 0.03)",
    "shadow-xl": "0 20px 24px -4px rgb(10 13 18 / 0.08), 0 8px 8px -4px rgb(10 13 18 / 0.03)",
    "shadow-2xl": "0 24px 48px -12px rgb(10 13 18 / 0.18)",
  },
};
