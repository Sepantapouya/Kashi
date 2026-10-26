import { forwardRef, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { formatCardNumber, getBankByCard, isValidCardNumber, onlyDigits, toFaDigits } from "@kashi-ui/persian";
import { Input, type InputProps } from "./Input.js";
import { mergeRefs } from "./utils.js";

type Base = Omit<InputProps, "value" | "defaultValue" | "onChange" | "type" | "inputMode" | "addonEnd">;

export interface CardNumberInputProps extends Base {
  /** مقدار کنترل‌شده: ۱۶ رقم لاتین بدون فاصله */
  value?: string;
  defaultValue?: string;
  /** با هر تغییر: ارقام لاتین، معتبر بودن و بانک تشخیص‌داده‌شده */
  onValueChange?: (value: string, valid: boolean, bank: string | null) => void;
  /** @default "fa" */
  digits?: "fa" | "latin";
  /** نمایش نام بانک از روی شش رقم اول @default true */
  showBank?: boolean;
  /** @default "شماره کارت معتبر نیست." */
  invalidMessage?: ReactNode;
}

/** شمارهٔ ارقام قبل از مکان‌نما را به موقعیت در متن قالب‌بندی‌شده تبدیل می‌کند */
function caretFor(formatted: string, digitCount: number): number {
  if (digitCount === 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/[0-9۰-۹]/.test(formatted[i]) && ++seen === digitCount) return i + 1;
  }
  return formatted.length;
}

/** فیلد شماره کارت بانکی: گروه‌بندی چهارتایی، تشخیص بانک و بررسی Luhn */
export const CardNumberInput = forwardRef<HTMLInputElement, CardNumberInputProps>(function CardNumberInput(
  { value, defaultValue = "", onValueChange, digits = "fa", showBank = true, invalidMessage = "شماره کارت معتبر نیست.", error, name, id, onBlur, placeholder, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const inputRef = useRef<HTMLInputElement>(null);
  const caret = useRef<number | null>(null);
  const [inner, setInner] = useState(() => onlyDigits(defaultValue).slice(0, 16));
  const [touched, setTouched] = useState(false);
  const raw = value !== undefined ? onlyDigits(value).slice(0, 16) : inner;
  const formatted = formatCardNumber(raw);
  const shown = digits === "fa" ? toFaDigits(formatted) : formatted;
  const bank = showBank ? getBankByCard(raw) : null;
  const showInvalid = raw.length > 0 && (touched || raw.length === 16) && !isValidCardNumber(raw);
  const bankId = `${inputId}-bank`;

  // پس از قالب‌بندی دوباره، مکان‌نما را سر جای منطقی‌اش برمی‌گرداند
  useLayoutEffect(() => {
    if (caret.current !== null && inputRef.current === document.activeElement) {
      const pos = caretFor(shown, caret.current);
      inputRef.current?.setSelectionRange(pos, pos);
      caret.current = null;
    }
  });

  return (
    <>
      <Input
        ref={mergeRefs(ref, inputRef)}
        id={inputId}
        type="text"
        inputMode="numeric"
        autoComplete="cc-number"
        dir="ltr"
        placeholder={placeholder ?? (digits === "fa" ? "۰۰۰۰ ۰۰۰۰ ۰۰۰۰ ۰۰۰۰" : "0000 0000 0000 0000")}
        value={shown}
        onChange={(e) => {
          const el = e.target;
          caret.current = onlyDigits(el.value.slice(0, el.selectionStart ?? el.value.length)).length;
          const next = onlyDigits(el.value).slice(0, 16);
          if (value === undefined) setInner(next);
          onValueChange?.(next, isValidCardNumber(next), getBankByCard(next)?.name ?? null);
        }}
        onBlur={(e) => {
          setTouched(true);
          onBlur?.(e);
        }}
        addonEnd={bank ? <span className="k-input__meta" id={bankId}>{bank.name}</span> : undefined}
        aria-describedby={bank ? bankId : undefined}
        error={error ?? (showInvalid ? invalidMessage : undefined)}
        {...rest}
      />
      {name && <input type="hidden" name={name} value={raw} />}
    </>
  );
});
