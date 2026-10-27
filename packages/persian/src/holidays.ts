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

export interface HolidayOptions {
  /** تعطیلات اضافه، کلید تاریخ میلادی YYYY-MM-DD یا «ماه-روز» شمسی */
  extra?: Record<string, string>;
  /** جمعه تعطیل حساب شود @default true */
  friday?: boolean;
}

/** نام تعطیلی آن روز یا null؛ جمعه‌ها «جمعه» */
export function getIranHoliday(date: Date, { extra = {}, friday = true }: HolidayOptions = {}): string | null {
  const { jm, jd } = toJalali(date);
  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return extra[iso] ?? extra[`${jm}-${jd}`] ?? IRAN_FIXED_HOLIDAYS[`${jm}-${jd}`] ?? (friday && date.getDay() === 5 ? "جمعه" : null);
}
