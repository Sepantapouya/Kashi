"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  JALALI_MONTHS, JALALI_MONTHS_EN, WEEKDAYS, WEEKDAYS_EN, WEEKDAYS_SHORT, WEEKDAYS_SHORT_EN,
  faMessages, getMessages, toFaDigits, type KashiLocale, type KashiMessages, type KashiMessagesInput,
} from "@kashi-ui/persian";

interface KashiContextValue {
  locale: KashiLocale;
  messages: KashiMessages;
  digits: "fa" | "latin";
}

const KashiContext = createContext<KashiContextValue>({ locale: "fa", messages: faMessages, digits: "fa" });

export interface KashiProviderProps {
  /** زبان متن‌های داخلی کامپوننت‌ها، نام ماه‌ها و روزها @default "fa" */
  locale?: KashiLocale;
  /** عوض کردن هر متن دلخواه: { common: { close: "Dismiss" } } */
  messages?: KashiMessagesInput;
  /** ارقام پیش‌فرض کامپوننت‌ها؛ prop ‏digits هر کامپوننت بر این مقدم است @default "fa" برای فارسی، "latin" برای انگلیسی */
  digits?: "fa" | "latin";
  children: ReactNode;
}

/**
 * زبان کامپوننت‌های کاشی: بدون آن همه‌چیز فارسی است. با locale="en" برچسب دکمه‌ها، متن صفحه‌خوان،
 * پیام‌های خطا، نام ماه‌ها و ارقام انگلیسی می‌شوند. جهت صفحه (dir) را خودتان روی html بگذارید.
 */
export function KashiProvider({ locale = "fa", messages, digits, children }: KashiProviderProps) {
  const value = useMemo(
    () => ({ locale, messages: getMessages(locale, messages), digits: digits ?? (locale === "en" ? "latin" : "fa") }),
    [locale, messages, digits],
  );
  return <KashiContext.Provider value={value}>{children}</KashiContext.Provider>;
}

/** زبان، فرهنگ متن‌ها و ارقام فعلی؛ n() عدد را با ارقام همان زبان می‌نویسد و months/weekdays نام‌های تقویم شمسی‌اند */
export function useKashi() {
  const ctx = useContext(KashiContext);
  const en = ctx.locale === "en";
  return {
    ...ctx,
    n: (v: number | string, digits = ctx.digits) => (digits === "fa" ? toFaDigits(String(v)) : String(v)),
    months: en ? JALALI_MONTHS_EN : JALALI_MONTHS,
    weekdays: en ? WEEKDAYS_EN : WEEKDAYS,
    weekdaysShort: en ? WEEKDAYS_SHORT_EN : WEEKDAYS_SHORT,
    /** نامی که getIranHoliday برای جمعه برمی‌گرداند */
    friday: en ? "Friday" : "جمعه",
  };
}
