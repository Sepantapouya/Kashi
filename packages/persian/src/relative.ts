import { toFaDigits } from "./digits.js";

export interface RelativeOptions {
  /** زمان مرجع @default new Date() */
  now?: Date;
  /** @default "fa" */
  digits?: "fa" | "latin";
}

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/**
 * زمان نسبی فارسی: «همین الان»، «۵ دقیقه پیش»، «دیروز»، «۳ روز دیگر»، «۲ سال پیش».
 * «دیروز» و «فردا» بر اساس روز تقویمی است، نه ۲۴ ساعت.
 */
export function formatRelative(date: Date, { now = new Date(), digits = "fa" }: RelativeOptions = {}): string {
  const diff = date.getTime() - now.getTime();
  const past = diff < 0;
  const abs = Math.abs(diff);
  const n = (v: number) => (digits === "fa" ? toFaDigits(v) : String(v));
  const say = (v: number, unit: string) => `${n(v)} ${unit} ${past ? "پیش" : "دیگر"}`;

  if (abs < 45_000) return "همین الان";
  if (abs < HOUR) return say(Math.max(1, Math.round(abs / MIN)), "دقیقه");

  const days = Math.round((startOfDay(date) - startOfDay(now)) / DAY);
  if (abs < 6 * HOUR || days === 0) return say(Math.round(abs / HOUR), "ساعت");
  if (days === -1) return "دیروز";
  if (days === 1) return "فردا";
  const d = Math.abs(days);
  if (d < 7) return say(d, "روز");
  if (d < 30) return say(Math.round(d / 7), "هفته");
  if (d < 365) return say(Math.max(1, Math.round(d / 30.44)), "ماه");
  return say(Math.round(d / 365.25), "سال");
}
