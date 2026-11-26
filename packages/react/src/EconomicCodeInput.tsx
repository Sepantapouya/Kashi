"use client";

import { forwardRef, useId, useState, type ReactNode } from "react";
import { economicCodeType, isValidEconomicCode, type EconomicCodeType } from "@kashi-ui/persian";
import { Input, type InputProps } from "./Input.js";
import { useDigitsInput } from "./useDigitsInput.js";
import { mergeRefs } from "./utils.js";
import { useKashi } from "./KashiProvider.js";

type Base = Omit<InputProps, "value" | "defaultValue" | "onChange" | "type" | "inputMode">;

export interface EconomicCodeInputProps extends Base {
  /** ارقام لاتین */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, valid: boolean, type: EconomicCodeType | null) => void;
  /** نمایش نوع (حقیقی، حقوقی یا کد قدیمی) کنار فیلد @default true */
  showType?: boolean;
  /** @default "fa" */
  digits?: "fa" | "latin";
  invalidMessage?: ReactNode;
}

/**
 * کد اقتصادی فاکتور: ۱۰ رقم (کد ملی شخص حقیقی)، ۱۱ رقم (شناسهٔ ملی شخص حقوقی) یا ۱۲ رقم قدیمی.
 * کد ملی و شناسهٔ ملی با رقم کنترل خودشان بررسی می‌شوند و نوع کنار فیلد می‌آید.
 */
export const EconomicCodeInput = forwardRef<HTMLInputElement, EconomicCodeInputProps>(function EconomicCodeInput(
  { value, defaultValue, onValueChange, showType = true, digits, invalidMessage, error, name, onBlur, placeholder, ...rest },
  ref,
) {
  const { messages: M, digits: D } = useKashi();
  digits ??= D;
  invalidMessage ??= M.invalid.economicCode;
  const { raw, shown, inputRef, handleChange } = useDigitsInput({ value, defaultValue, maxDigits: 12, format: (d) => d, digits });
  const [touched, setTouched] = useState(false);
  const type = economicCodeType(raw);
  const valid = isValidEconomicCode(raw);
  const typeId = useId();
  const showInvalid = raw.length > 0 && (touched || raw.length === 12) && !valid;
  return (
    <>
      <Input
        ref={mergeRefs(ref, inputRef)}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        dir="ltr"
        placeholder={placeholder ?? (digits === "fa" ? "۰۰۰۰۰۰۰۰۰۰۰" : "00000000000")}
        value={shown}
        onChange={(e) => {
          const next = handleChange(e);
          onValueChange?.(next, isValidEconomicCode(next), economicCodeType(next));
        }}
        onBlur={(e) => {
          setTouched(true);
          onBlur?.(e);
        }}
        addonEnd={showType && type && valid ? <span className="k-input__meta" id={typeId}>{M.taxCode[type]}</span> : undefined}
        aria-describedby={showType && type && valid ? typeId : undefined}
        error={error ?? (showInvalid ? invalidMessage : undefined)}
        {...rest}
      />
      {name && <input type="hidden" name={name} value={raw} />}
    </>
  );
});
