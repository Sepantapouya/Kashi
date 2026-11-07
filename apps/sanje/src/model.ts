import { channelIds, sessions, type Channel } from "./reportData";

export const pages = {
  dashboard: {
    title: "نمای کلی",
    description: "تصویر روشن عملکرد فروشگاه، از اولین بازدید تا خرید.",
    icon: "chart",
  },
  funnel: {
    title: "قیف خرید",
    description: "مسیر خرید را دنبال کنید و نقطه‌های ریزش را بشناسید.",
    icon: "funnel",
  },
  channels: {
    title: "کانال‌های جذب",
    description: "ارزش ورودی هر کانال را با نتیجهٔ فروش مقایسه کنید.",
    icon: "compass",
  },
  sessions: {
    title: "نشست‌ها",
    description: "هر بازدید، یک مسیر. رفتار و نتیجهٔ نشست‌ها را بررسی کنید.",
    icon: "users",
  },
  events: {
    title: "رویدادها",
    description: "دفتر تعامل‌های فروشگاه با امکان جستجو و بررسی جزئیات.",
    icon: "layers",
  },
  saved: {
    title: "گزارش‌های ذخیره‌شده",
    description: "نماهای پرکاربردتان را با همان فیلترها دوباره باز کنید.",
    icon: "bookmark",
  },
  settings: {
    title: "تنظیمات",
    description: "فضای کاری و تجربهٔ گزارش‌گیری را برای خودتان تنظیم کنید.",
    icon: "settings",
  },
  guide: {
    title: "راهنمای سنجه",
    description: "یک مسیر کوتاه برای شناخت گزارش‌های فروشگاه.",
    icon: "info",
  },
} as const;
export type Page = keyof typeof pages;
export type Filters = {
  days: string;
  channel: string;
  device: string;
  stage: string;
  query: string;
};
export const devices = { mobile: "موبایل", desktop: "دسکتاپ", tablet: "تبلت" };
export const data = sessions.map((session, index) => ({
  ...session,
  device: (
    ["mobile", "desktop", "mobile", "mobile", "desktop", "tablet"] as const
  )[index % 6],
  city: ["تهران", "اصفهان", "شیراز", "مشهد", "تبریز", "رشت"][index % 6],
}));
export type Session = (typeof data)[number];
export const initialFilters: Filters = {
  days: "7",
  channel: "all",
  device: "all",
  stage: "all",
  query: "",
};
export function readFilters(search: string): Filters {
  const params = new URLSearchParams(search);
  const days = params.get("days") || "7";
  const channel = params.get("channel") || "all";
  const device = params.get("device") || "all";
  const stage = params.get("stage") || "all";
  return {
    days: ["7", "14", "30"].includes(days) ? days : "7",
    channel: channelIds.includes(channel as Channel) ? channel : "all",
    device: Object.hasOwn(devices, device) ? device : "all",
    stage: ["0", "1", "2", "3"].includes(stage) ? stage : "all",
    query: (params.get("q") || "").slice(0, 200),
  };
}
export function reportUrl(page: Page, filters: Filters): string {
  const params = new URLSearchParams({ days: filters.days });
  if (filters.channel !== "all") params.set("channel", filters.channel);
  if (filters.device !== "all") params.set("device", filters.device);
  if (page === "events" && filters.stage !== "all")
    params.set("stage", filters.stage);
  if (["sessions", "events"].includes(page) && filters.query)
    params.set("q", filters.query);
  return `/${page}/?${params}`;
}
export function selectRows(filters: Filters, previous = false) {
  const days = Number(filters.days);
  const end = previous ? 30 - days : 30;
  return data.filter(
    (row) =>
      row.day > end - days &&
      row.day <= end &&
      (filters.channel === "all" || row.channel === filters.channel) &&
      (filters.device === "all" || row.device === filters.device),
  );
}
export type Preferences = {
  name: string;
  goal: number;
  pageSize: number;
  compact: boolean;
};
export const defaultPreferences: Preferences = {
  name: "فروشگاه کاروان",
  goal: 60000000,
  pageSize: 12,
  compact: false,
};
export type SavedReport = {
  id: string;
  name: string;
  url: string;
  created: string;
};
export function loadPreferences(): Preferences {
  try {
    const value = JSON.parse(
      localStorage.getItem("sanje-preferences") || "null",
    );
    if (!value || typeof value !== "object") return defaultPreferences;
    return {
      name:
        typeof value.name === "string" && value.name.trim()
          ? value.name.slice(0, 60)
          : defaultPreferences.name,
      goal:
        Number.isFinite(value.goal) && value.goal > 0
          ? value.goal
          : defaultPreferences.goal,
      pageSize: [12, 24, 48].includes(value.pageSize) ? value.pageSize : 12,
      compact: value.compact === true,
    };
  } catch {
    return defaultPreferences;
  }
}
export function loadSaved(): SavedReport[] {
  try {
    const value = JSON.parse(localStorage.getItem("sanje-saved") || "[]");
    if (!Array.isArray(value)) return [];
    return value
      .filter(
        (item) =>
          typeof item?.id === "string" &&
          typeof item.name === "string" &&
          typeof item.created === "string" &&
          typeof item.url === "string" &&
          /^\/(dashboard|funnel|channels|sessions|events)\/\?/.test(item.url),
      )
      .slice(0, 50);
  } catch {
    return [];
  }
}
export function persist(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function downloadCsv(name: string, rows: (string | number)[][]) {
  const escapeCell = (value: string | number) => {
    let text = String(value);
    if (/^[=+@\-\t\r]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  };
  const blob = new Blob(
    ["\uFEFF" + rows.map((row) => row.map(escapeCell).join(",")).join("\r\n")],
    { type: "text/csv;charset=utf-8" },
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name + ".csv";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
