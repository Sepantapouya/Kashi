import { toFaDigits } from "./digits.js";

export interface RelativeOptions {
  /** زمان مرجع @default new Date() */
  now?: Date;
  /** پیش‌فرض: "fa" برای locale فارسی و "latin" برای انگلیسی */
  digits?: "fa" | "latin";
  /** "en" ← «5 minutes ago»، «yesterday» @default "fa" */
  locale?: "fa" | "en";
}

const EN_UNITS: Record<string, string> = { دقیقه: "minute", ساعت: "hour", روز: "day", هفته: "week", ماه: "month", سال: "year" };

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/**
 * زمان نسبی فارسی: «همین الان»، «۵ دقیقه پیش»، «دیروز»، «۳ روز دیگر»، «۲ سال پیش».
 * «دیروز» و «فردا» بر اساس روز تقویمی است، نه ۲۴ ساعت.
 */
export function formatRelative(date: Date, { now = new Date(), locale = "fa", digits = locale === "en" ? "latin" : "fa" }: RelativeOptions = {}): string {
  const en = locale === "en";
  const diff = date.getTime() - now.getTime();
  const past = diff < 0;
  const abs = Math.abs(diff);
  const n = (v: number) => (digits === "fa" ? toFaDigits(v) : String(v));
  const say = (v: number, unit: string) => {
    if (!en) return `${n(v)} ${unit} ${past ? "پیش" : "دیگر"}`;
    const u = `${EN_UNITS[unit]}${v === 1 ? "" : "s"}`;
    return past ? `${n(v)} ${u} ago` : `in ${n(v)} ${u}`;
  };

  if (abs < 45_000) return en ? "just now" : "همین الان";
  if (abs < HOUR) return say(Math.max(1, Math.round(abs / MIN)), "دقیقه");

  const days = Math.round((startOfDay(date) - startOfDay(now)) / DAY);
  if (abs < 6 * HOUR || days === 0) return say(Math.round(abs / HOUR), "ساعت");
  if (days === -1) return en ? "yesterday" : "دیروز";
  if (days === 1) return en ? "tomorrow" : "فردا";
  const d = Math.abs(days);
  if (d < 7) return say(d, "روز");
  if (d < 30) return say(Math.round(d / 7), "هفته");
  if (d < 365) return say(Math.max(1, Math.round(d / 30.44)), "ماه");
  return say(Math.round(d / 365.25), "سال");
}
