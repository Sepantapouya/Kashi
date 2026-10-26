import { useRef, useState, type ChangeEvent } from "react";
import { onlyDigits } from "@kashi-ui/persian";
import { useIsomorphicLayoutEffect } from "./utils.js";

export interface DigitsInputOptions {
  value?: string;
  defaultValue?: string;
  /** حداکثر تعداد رقم */
  maxDigits: number;
  /** متن نمایشی از روی ارقام خام (با ارقام لاتین) */
  format: (raw: string) => string;
  /** پیش‌پردازش ارقام، مثلاً تبدیل +98 به 0 */
  normalize?: (digits: string) => string;
  /** خط ارقام نمایشی */
  digits: "fa" | "latin";
}

const FA = "۰۱۲۳۴۵۶۷۸۹";
const fa = (s: string) => s.replace(/\d/g, (d) => FA[Number(d)]);

/** موقعیت مکان‌نما پس از n رقم در متن قالب‌بندی‌شده */
function caretAfter(text: string, n: number): number {
  if (n === 0) return text.search(/[0-9۰-۹]/) === -1 ? text.length : text.search(/[0-9۰-۹]/);
  let seen = 0;
  for (let i = 0; i < text.length; i++) if (/[0-9۰-۹]/.test(text[i]) && ++seen === n) return i + 1;
  return text.length;
}

/**
 * منطق مشترک فیلدهای عددی قالب‌بندی‌شده (کارت، شبا، موبایل، مبلغ):
 * ارقام فارسی و لاتین را می‌پذیرد، بقیه را حذف می‌کند و مکان‌نما را پس از قالب‌بندی سر جایش نگه می‌دارد.
 */
export function useDigitsInput({ value, defaultValue = "", maxDigits, format, normalize = (d) => d, digits }: DigitsInputOptions) {
  const clean = (input: string) => normalize(onlyDigits(input)).slice(0, maxDigits);
  const [inner, setInner] = useState(() => clean(defaultValue));
  const raw = value !== undefined ? clean(value) : inner;
  const formatted = format(raw);
  const shown = digits === "fa" ? fa(formatted) : formatted;
  const inputRef = useRef<HTMLInputElement>(null);
  const caret = useRef<number | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (caret.current !== null && inputRef.current === document.activeElement) {
      const pos = caretAfter(shown, caret.current);
      inputRef.current?.setSelectionRange(pos, pos);
      caret.current = null;
    }
  });

  /** ارقام خام جدید را برمی‌گرداند؛ حالت داخلی را هم به‌روز می‌کند */
  const handleChange = (e: ChangeEvent<HTMLInputElement>): string => {
    const el = e.target;
    const before = el.value.slice(0, el.selectionStart ?? el.value.length);
    const next = clean(el.value);
    caret.current = Math.min(onlyDigits(before).length, next.length);
    if (value === undefined) setInner(next);
    return next;
  };

  return { raw, shown, inputRef, handleChange };
}
