import { WEEKDAYS, WEEKDAYS_EN, jalaliWeekday } from "./jalali.js";
import { toFaDigits } from "./digits.js";
import { parseTime } from "./time.js";

/** یک بازهٔ کاری، مثل { from: "09:00", to: "13:00" } */
export interface TimeRange {
  from: string;
  to: string;
}
/** ساعت‌های یک روز؛ open: false یعنی تعطیل */
export interface DayHours {
  open: boolean;
  ranges: TimeRange[];
}
/** هفت روز از شنبه تا جمعه */
export type WeekHours = DayHours[];

const min = (t: string) => {
  const p = parseTime(t);
  return p ? p.hours * 60 + p.minutes : NaN;
};

/** ساعت کاری رایج: شنبه تا چهارشنبه ۹ تا ۱۷، پنجشنبه ۹ تا ۱۳، جمعه تعطیل */
export function defaultWeekHours(): WeekHours {
  return Array.from({ length: 7 }, (_, i) =>
    i === 6 ? { open: false, ranges: [] } : { open: true, ranges: [{ from: "09:00", to: i === 5 ? "13:00" : "17:00" }] },
  );
}

/** بازهٔ نامعتبر (پایان پیش از شروع یا ساعت غلط) یا هم‌پوشان؛ اندیس بازه‌های مشکل‌دار را برمی‌گرداند */
export function invalidRanges(day: DayHours): number[] {
  if (!day.open) return [];
  const bad = new Set<number>();
  day.ranges.forEach((r, i) => {
    const a = min(r.from), b = min(r.to);
    if (!(a < b)) bad.add(i);
    day.ranges.forEach((s, j) => {
      if (j > i && min(s.from) < b && a < min(s.to)) bad.add(i).add(j);
    });
  });
  return [...bad].sort();
}

/** آیا در این لحظه باز است؟ بازهٔ «۲۲:۰۰ تا ۰۲:۰۰» از نیمه‌شب می‌گذرد و تا بامداد روز بعد حساب می‌شود */
export function isOpenAt(week: WeekHours, date: Date = new Date()): boolean {
  const w = jalaliWeekday(date);
  const now = date.getHours() * 60 + date.getMinutes();
  const today = week[w];
  if (today?.open && today.ranges.some((r) => (min(r.from) < min(r.to) ? now >= min(r.from) && now < min(r.to) : now >= min(r.from)))) return true;
  const prev = week[(w + 6) % 7];
  return !!prev?.open && prev.ranges.some((r) => min(r.from) > min(r.to) && now < min(r.to));
}

export interface SummarizeHoursOptions {
  /** @default "fa" */
  locale?: "fa" | "en";
}

/**
 * خلاصهٔ خوانا با یکی کردن روزهای پشت‌سرهم که ساعت یکسان دارند:
 * «شنبه تا چهارشنبه ۰۹:۰۰ تا ۱۷:۰۰؛ پنجشنبه ۰۹:۰۰ تا ۱۳:۰۰؛ جمعه تعطیل»
 */
export function summarizeHours(week: WeekHours, { locale = "fa" }: SummarizeHoursOptions = {}): string {
  const en = locale === "en";
  const names = en ? WEEKDAYS_EN : WEEKDAYS;
  const d = (s: string) => (en ? s : toFaDigits(s));
  const key = (day: DayHours) => (day.open && day.ranges.length ? day.ranges.map((r) => `${r.from}-${r.to}`).join(",") : "closed");
  const text = (day: DayHours) =>
    key(day) === "closed" ? (en ? "closed" : "تعطیل") : day.ranges.map((r) => d(`${r.from}${en ? "–" : " تا "}${r.to}`)).join(en ? ", " : " و ");
  const parts: string[] = [];
  for (let i = 0; i < 7; ) {
    let j = i;
    while (j + 1 < 7 && key(week[j + 1]) === key(week[i])) j++;
    const days = i === j ? names[i] : `${names[i]}${en ? "–" : " تا "}${names[j]}`;
    parts.push(`${days}${en ? ": " : " "}${text(week[i])}`);
    i = j + 1;
  }
  return parts.join(en ? "; " : "؛ ");
}
