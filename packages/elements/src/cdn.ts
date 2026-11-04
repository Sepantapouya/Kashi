// نسخهٔ CDN با بارگذاری تنبل: هر بخش فقط وقتی یکی از تگ‌هایش در صفحه پیدا شود دانلود می‌شود.
// صفحه‌ای که فقط فیلد کد ملی دارد، نقشه و نمودارها را دانلود نمی‌کند.
export { toast } from "./toast.js";
// زبان پیش از بارگذاری عنصرها: <script type="module">import { setLocale } from ".../kashi-elements.js"; setLocale("en");</script>
export { setLocale } from "./base.js";

const MODULES: [string[], () => Promise<unknown>][] = [
  [["kashi-national-id", "kashi-legal-id", "kashi-mobile", "kashi-landline", "kashi-card-number", "kashi-iban", "kashi-postal-code", "kashi-price"], () => import("./inputs.js")],
  [["kashi-otp"], () => import("./fields.js")],
  [["kashi-combobox", "kashi-province-select", "kashi-city-select"], () => import("./combobox.js")],
  [["kashi-iran-map", "kashi-address-form"], () => import("./map.js")],
  [["kashi-calendar", "kashi-date-picker"], () => import("./calendar.js")],
  [["kashi-money", "kashi-date", "kashi-relative-time", "kashi-countdown"], () => import("./display.js")],
  [["kashi-dialog", "kashi-tabs", "kashi-tooltip", "kashi-copy-button"], () => import("./overlay.js")],
  [["kashi-dropdown-menu", "kashi-popover"], () => import("./menu.js")],
  [["kashi-tag-input", "kashi-number-input", "kashi-rating", "kashi-pagination"], () => import("./controls.js")],
  [["kashi-data-table"], () => import("./table.js")],
  [["kashi-multi-select", "kashi-slider", "kashi-chip-group", "kashi-password-strength", "kashi-persian-textarea", "kashi-keyboard-fix", "kashi-time-input", "kashi-plate-input", "kashi-inline-edit"], () => import("./forms.js")],
  [["kashi-date-range-picker", "kashi-month-picker", "kashi-file-upload", "kashi-color-picker"], () => import("./pickers.js")],
  [["kashi-bar-chart", "kashi-line-chart", "kashi-pie-chart", "kashi-bar-list", "kashi-proportion-bar", "kashi-sparkline", "kashi-activity-heatmap"], () => import("./charts.js")],
  [["kashi-input", "kashi-textarea", "kashi-banner"], () => import("./basic.js")],
  [["kashi-appointment-picker"], () => import("./appointment.js")],
  [["kashi-command-palette", "kashi-context-menu", "kashi-carousel", "kashi-tree-view", "kashi-tour", "kashi-splitter", "kashi-side-nav"], () => import("./nav.js")],
];

const pending = new Set(MODULES);
/** بخش‌هایی را که تگشان در صفحه است بارگذاری می‌کند */
function scan() {
  for (const entry of pending) {
    if (!document.querySelector(entry[0].join(","))) continue;
    pending.delete(entry);
    entry[1]().catch((e) => console.error("[kashi] بارگذاری نشد:", e));
  }
  if (!pending.size) observer?.disconnect();
}

/** همهٔ عنصرها را همین حالا بارگذاری می‌کند؛ مثلاً پیش از ساختن عنصرها با JavaScript */
export function loadAll(): Promise<unknown[]> {
  const all = [...pending].map(([, load]) => load());
  pending.clear();
  observer?.disconnect();
  return Promise.all(all);
}

let observer: MutationObserver | null = null;
if (typeof document !== "undefined") {
  scan();
  observer = new MutationObserver(scan);
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
