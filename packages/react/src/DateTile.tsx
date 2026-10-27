import { forwardRef, type HTMLAttributes } from "react";
import { getIranHoliday, JALALI_MONTHS, jalaliWeekday, toFaDigits, toISODate, toJalali, WEEKDAYS, type HolidayOptions } from "@kashi-ui/persian";
import { cx } from "./cx.js";

export interface DateTileProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  date: Date;
  /** نمایش مناسبت تعطیل رسمی؛ true یا تنظیمات getIranHoliday @default true */
  holidays?: boolean | HolidayOptions;
  /** تاریخ میلادی معادل در پایین @default true */
  gregorian?: boolean;
  size?: "sm" | "md" | "lg";
}

const gregFmt = new Intl.DateTimeFormat("fa-IR-u-ca-gregory-nu-arabext", { day: "numeric", month: "long", year: "numeric" });

/** کاشی تاریخ شمسی به شکل برگ تقویم: روز، ماه، روز هفته، مناسبت تعطیل و معادل میلادی */
export const DateTile = forwardRef<HTMLTimeElement, DateTileProps>(function DateTile(
  { date, holidays = true, gregorian = true, size = "md", className, ...rest },
  ref,
) {
  const { jy, jm, jd } = toJalali(date);
  const holiday = holidays ? getIranHoliday(date, holidays === true ? {} : holidays) : null;
  const occasion = holiday && holiday !== "جمعه" ? holiday : null;
  return (
    <time
      ref={ref}
      dateTime={toISODate(date)}
      className={cx("k-datetile", `k-datetile--${size}`, className)}
      data-holiday={holiday ? "" : undefined}
      {...rest}
    >
      <span className="k-datetile__head">{JALALI_MONTHS[jm - 1]} {toFaDigits(jy)}</span>
      <span className="k-datetile__day">{toFaDigits(jd)}</span>
      <span className="k-datetile__weekday">{WEEKDAYS[jalaliWeekday(date)]}</span>
      {occasion && <span className="k-datetile__occasion">{occasion}</span>}
      {gregorian && <span className="k-datetile__greg">{gregFmt.format(date)}</span>}
    </time>
  );
});
