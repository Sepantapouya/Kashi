import { forwardRef, useState, type ReactNode } from "react";
import { isValidNationalId, onlyDigits, toFaDigits } from "@kashi-ui/persian";
import { Input, type InputProps } from "./Input.js";

type Base = Omit<InputProps, "value" | "defaultValue" | "onChange" | "type" | "inputMode">;

export interface NationalIdInputProps extends Base {
  /** مقدار کنترل‌شده با ارقام لاتین، مثل "0013542419" */
  value?: string;
  defaultValue?: string;
  /** با هر تغییر: مقدار با ارقام لاتین و معتبر بودن آن */
  onValueChange?: (value: string, valid: boolean) => void;
  /** خط ارقام نمایشی @default "fa" */
  digits?: "fa" | "latin";
  /** @default "کد ملی معتبر نیست." */
  invalidMessage?: ReactNode;
}

/** فیلد کد ملی: ارقام فارسی و لاتین را می‌پذیرد، ۱۰ رقم را محدود و رقم کنترل را بررسی می‌کند. */
export const NationalIdInput = forwardRef<HTMLInputElement, NationalIdInputProps>(function NationalIdInput(
  { value, defaultValue = "", onValueChange, digits = "fa", invalidMessage = "کد ملی معتبر نیست.", error, name, onBlur, placeholder, ...rest },
  ref,
) {
  const [inner, setInner] = useState(() => onlyDigits(defaultValue).slice(0, 10));
  const [touched, setTouched] = useState(false);
  const raw = value !== undefined ? onlyDigits(value).slice(0, 10) : inner;
  // خطا فقط پس از خروج از فیلد یا کامل شدن ۱۰ رقم نمایش داده می‌شود
  const showInvalid = raw.length > 0 && (touched || raw.length === 10) && !isValidNationalId(raw);

  return (
    <>
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        dir="ltr"
        placeholder={placeholder ?? (digits === "fa" ? "۰۰۰۰۰۰۰۰۰۰" : "0000000000")}
        value={digits === "fa" ? toFaDigits(raw) : raw}
        onChange={(e) => {
          const next = onlyDigits(e.target.value).slice(0, 10);
          if (value === undefined) setInner(next);
          onValueChange?.(next, isValidNationalId(next));
        }}
        onBlur={(e) => {
          setTouched(true);
          onBlur?.(e);
        }}
        error={error ?? (showInvalid ? invalidMessage : undefined)}
        {...rest}
      />
      {name && <input type="hidden" name={name} value={raw} />}
    </>
  );
});
