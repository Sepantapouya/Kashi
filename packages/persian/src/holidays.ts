import { toJalali } from "./jalali.js";

/**
 * تعطیلات رسمی ثابت تقویم خورشیدی، کلید «ماه-روز» شمسی.
 * تعطیلات قمری (عید فطر، عاشورا و…) هر سال با رؤیت ماه جابه‌جا می‌شوند؛
 * آن‌ها را از تقویم رسمی همان سال با پارامتر extra بدهید.
 */
export const IRAN_FIXED_HOLIDAYS: Record<string, string> = {
  "1-1": "عید نوروز",
  "1-2": "عید نوروز",
  "1-3": "عید نوروز",
  "1-4": "عید نوروز",
  "1-12": "روز جمهوری اسلامی",
  "1-13": "روز طبیعت",
  "3-14": "رحلت امام خمینی",
  "3-15": "قیام ۱۵ خرداد",
  "11-22": "پیروزی انقلاب اسلامی",
  "12-29": "ملی شدن صنعت نفت",
};

/** همان تعطیلات به انگلیسی، برای رابط انگلیسی */
export const IRAN_FIXED_HOLIDAYS_EN: Record<string, string> = {
  "1-1": "Nowruz",
  "1-2": "Nowruz",
  "1-3": "Nowruz",
  "1-4": "Nowruz",
  "1-12": "Islamic Republic Day",
  "1-13": "Nature Day",
  "3-14": "Death of Imam Khomeini",
  "3-15": "15 Khordad Uprising",
  "11-22": "Islamic Revolution Victory Day",
  "12-29": "Oil Nationalization Day",
};

export interface HolidayOptions {
  /** تعطیلات اضافه، کلید تاریخ میلادی YYYY-MM-DD یا «ماه-روز» شمسی */
  extra?: Record<string, string>;
  /** جمعه تعطیل حساب شود @default true */
  friday?: boolean;
  /** زبان نام تعطیلی؛ با "en" جمعه «Friday» است @default "fa" */
  locale?: "fa" | "en";
}

/** نام تعطیلی آن روز یا null؛ جمعه‌ها «جمعه» */
export function getIranHoliday(date: Date, { extra = {}, friday = true, locale = "fa" }: HolidayOptions = {}): string | null {
  const { jm, jd } = toJalali(date);
  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const fixed = (locale === "en" ? IRAN_FIXED_HOLIDAYS_EN : IRAN_FIXED_HOLIDAYS)[`${jm}-${jd}`];
  return extra[iso] ?? extra[`${jm}-${jd}`] ?? fixed ?? (friday && date.getDay() === 5 ? (locale === "en" ? "Friday" : "جمعه") : null);
}
