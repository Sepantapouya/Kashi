"use client";

import { forwardRef, useState, type ReactNode } from "react";
import { isValidTaxId, normalizeTaxId } from "@kashi-ui/persian";
import { Input, type InputProps } from "./Input.js";
import { useKashi } from "./KashiProvider.js";

type Base = Omit<InputProps, "value" | "defaultValue" | "onChange" | "type" | "inputMode">;

export interface TaxIdInputProps extends Base {
  /** مقدار یکدست‌شده: ارقام لاتین و حروف بزرگ */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, valid: boolean) => void;
  invalidMessage?: ReactNode;
}

/**
 * شمارهٔ منحصربه‌فرد مالیاتی فاکتور (سامانهٔ مودیان): ۲۲ نویسه.
 * ارقام فارسی لاتین می‌شوند، حروف بزرگ و فاصله و خط تیره حذف؛ فقط شکل بررسی می‌شود.
 */
export const TaxIdInput = forwardRef<HTMLInputElement, TaxIdInputProps>(function TaxIdInput(
  { value, defaultValue = "", onValueChange, invalidMessage, error, name, onBlur, placeholder, ...rest },
  ref,
) {
  const { messages: M } = useKashi();
  invalidMessage ??= M.invalid.taxId;
  const [inner, setInner] = useState(() => normalizeTaxId(defaultValue).slice(0, 22));
  const [touched, setTouched] = useState(false);
  const raw = value !== undefined ? normalizeTaxId(value).slice(0, 22) : inner;
  const showInvalid = raw.length > 0 && (touched || raw.length === 22) && !isValidTaxId(raw);
  return (
    <>
      <Input
        ref={ref}
        type="text"
        variant="code"
        dir="ltr"
        placeholder={placeholder ?? "A1B2C3…"}
        value={raw}
        onChange={(e) => {
          const next = normalizeTaxId(e.target.value).slice(0, 22);
          if (value === undefined) setInner(next);
          onValueChange?.(next, isValidTaxId(next));
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
