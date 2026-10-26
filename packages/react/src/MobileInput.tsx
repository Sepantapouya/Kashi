import { forwardRef, useId, useState, type ReactNode } from "react";
import { formatMobile, getMobileOperator, isValidMobile, normalizeMobile } from "@kashi-ui/persian";
import { Input, type InputProps } from "./Input.js";
import { useDigitsInput } from "./useDigitsInput.js";
import { mergeRefs } from "./utils.js";

type Base = Omit<InputProps, "value" | "defaultValue" | "onChange" | "type" | "inputMode" | "addonEnd">;

export interface MobileInputProps extends Base {
  /** مقدار کنترل‌شده، مثل "09123456789" یا "+989123456789" */
  value?: string;
  defaultValue?: string;
  /** با هر تغییر: شماره به شکل ۰۹xxxxxxxxx، معتبر بودن و نام اپراتور */
  onValueChange?: (value: string, valid: boolean, operator: string | null) => void;
  /** @default "fa" */
  digits?: "fa" | "latin";
  /** نمایش نام اپراتور @default true */
  showOperator?: boolean;
  /** @default "شماره موبایل معتبر نیست." */
  invalidMessage?: ReactNode;
}

/** فیلد شماره موبایل: +98 و 0098 را به 09 تبدیل می‌کند، گروه‌بندی و تشخیص اپراتور */
export const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(function MobileInput(
  { value, defaultValue, onValueChange, digits = "fa", showOperator = true, invalidMessage = "شماره موبایل معتبر نیست.", error, name, id, onBlur, placeholder, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [touched, setTouched] = useState(false);
  const { raw, shown, inputRef, handleChange } = useDigitsInput({
    value,
    defaultValue,
    maxDigits: 11,
    normalize: normalizeMobile,
    format: formatMobile,
    digits,
  });
  const operator = showOperator ? getMobileOperator(raw) : null;
  const showInvalid = raw.length > 0 && (touched || raw.length === 11) && !isValidMobile(raw);
  const opId = `${inputId}-operator`;

  return (
    <>
      <Input
        ref={mergeRefs(ref, inputRef)}
        id={inputId}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        dir="ltr"
        placeholder={placeholder ?? (digits === "fa" ? "۰۹۱۲ ۳۴۵ ۶۷۸۹" : "0912 345 6789")}
        value={shown}
        onChange={(e) => {
          const next = handleChange(e);
          onValueChange?.(next, isValidMobile(next), getMobileOperator(next)?.name ?? null);
        }}
        onBlur={(e) => {
          setTouched(true);
          onBlur?.(e);
        }}
        addonEnd={operator ? <span className="k-input__meta" id={opId}>{operator.name}</span> : undefined}
        aria-describedby={operator ? opId : undefined}
        error={error ?? (showInvalid ? invalidMessage : undefined)}
        {...rest}
      />
      {name && <input type="hidden" name={name} value={raw} />}
    </>
  );
});
