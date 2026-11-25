"use client";

import { forwardRef, useState, type ReactNode } from "react";
import { formatSayad, isValidSayad } from "@kashi-ui/persian";
import { Input, type InputProps } from "./Input.js";
import { useDigitsInput } from "./useDigitsInput.js";
import { mergeRefs } from "./utils.js";
import { useKashi } from "./KashiProvider.js";

type Base = Omit<InputProps, "value" | "defaultValue" | "onChange" | "type" | "inputMode">;

export interface SayadInputProps extends Base {
  /** ارقام لاتین، مثل "1234567890123456" */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, valid: boolean) => void;
  /** @default "fa" */
  digits?: "fa" | "latin";
  /** @default "شناسهٔ صیادی باید ۱۶ رقم باشد." */
  invalidMessage?: ReactNode;
}

/** شناسهٔ صیادی چک: ۱۶ رقم در گروه‌های چهارتایی؛ فقط طول بررسی می‌شود چون رقم کنترل آن عمومی نیست */
export const SayadInput = forwardRef<HTMLInputElement, SayadInputProps>(function SayadInput(
  { value, defaultValue, onValueChange, digits, invalidMessage, error, name, onBlur, placeholder, ...rest },
  ref,
) {
  const { messages: M, digits: D } = useKashi();
  digits ??= D;
  invalidMessage ??= M.invalid.sayad;
  const { raw, shown, inputRef, handleChange } = useDigitsInput({ value, defaultValue, maxDigits: 16, format: formatSayad, digits });
  const [touched, setTouched] = useState(false);
  const showInvalid = raw.length > 0 && touched && !isValidSayad(raw);
  return (
    <>
      <Input
        ref={mergeRefs(ref, inputRef)}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        dir="ltr"
        placeholder={placeholder ?? (digits === "fa" ? "۰۰۰۰ ۰۰۰۰ ۰۰۰۰ ۰۰۰۰" : "0000 0000 0000 0000")}
        value={shown}
        onChange={(e) => {
          const next = handleChange(e);
          onValueChange?.(next, isValidSayad(next));
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
