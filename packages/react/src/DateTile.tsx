"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { getIranHoliday, JALALI_MONTHS, jalaliWeekday, toFaDigits, toISODate, toJalali, WEEKDAYS, type HolidayOptions } from "@kashi-ui/persian";
import { cx } from "./cx.js";
import { useKashi } from "./KashiProvider.js";

export interface DateTileProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  date: Date;
  /** نمایش مناسبت تعطیل رسمی؛ true یا تنظیمات getIranHoliday @default true */
  holidays?: boolean | HolidayOptions;
  /** تاریخ میلادی معادل در پایین @default true */
  gregorian?: boolean;
  size?: "sm" | "md" | "lg";
}

const gregFmt = new Intl.DateTimeFormat("fa-IR-u-ca-gregory-nu-arabext", { day: "numeric", month: "long", year: "numeric" });
const gregFmtEn = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", year: "numeric" });

/** کاشی تاریخ شمسی به شکل برگ تقویم: روز، ماه، روز هفته، مناسبت تعطیل و معادل میلادی */
export const DateTile = forwardRef<HTMLTimeElement, DateTileProps>(function DateTile(
  { date, holidays = true, gregorian = true, size = "md", className, ...rest },
  ref,
) {
  const { jy, jm, jd } = toJalali(date);
  const { n, locale, months: MONTHS, weekdays: WD, friday: FRI } = useKashi();
  const holiday = holidays ? getIranHoliday(date, holidays === true ? { locale } : { locale, ...holidays }) : null;
  const occasion = holiday && holiday !== FRI ? holiday : null;
  return (
    <time
      ref={ref}
      dateTime={toISODate(date)}
      className={cx("k-datetile", `k-datetile--${size}`, className)}
      data-holiday={holiday ? "" : undefined}
      {...rest}
    >
      <span className="k-datetile__head">{MONTHS[jm - 1]} {n(jy)}</span>
      <span className="k-datetile__day">{n(jd)}</span>
      <span className="k-datetile__weekday">{WD[jalaliWeekday(date)]}</span>
      {occasion && <span className="k-datetile__occasion">{occasion}</span>}
      {gregorian && <span className="k-datetile__greg">{(locale === "en" ? gregFmtEn : gregFmt).format(date)}</span>}
    </time>
  );
});
