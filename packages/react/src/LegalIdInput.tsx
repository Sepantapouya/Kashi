import { forwardRef, useState, type ReactNode } from "react";
import { isValidLegalId, onlyDigits, toFaDigits } from "@kashi-ui/persian";
import { Input, type InputProps } from "./Input.js";

type Base = Omit<InputProps, "value" | "defaultValue" | "onChange" | "type" | "inputMode">;

export interface LegalIdInputProps extends Base {
  /** مقدار کنترل‌شده با ارقام لاتین، مثل "10380284790" */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, valid: boolean) => void;
  /** @default "fa" */
  digits?: "fa" | "latin";
  /** @default "شناسهٔ ملی معتبر نیست." */
  invalidMessage?: ReactNode;
}

/** شناسهٔ ملی اشخاص حقوقی (شرکت‌ها): ۱۱ رقم با بررسی رقم کنترل */
export const LegalIdInput = forwardRef<HTMLInputElement, LegalIdInputProps>(function LegalIdInput(
  { value, defaultValue = "", onValueChange, digits = "fa", invalidMessage = "شناسهٔ ملی معتبر نیست.", error, name, onBlur, placeholder, ...rest },
  ref,
) {
  const [inner, setInner] = useState(() => onlyDigits(defaultValue).slice(0, 11));
  const [touched, setTouched] = useState(false);
  const raw = value !== undefined ? onlyDigits(value).slice(0, 11) : inner;
  const showInvalid = raw.length > 0 && (touched || raw.length === 11) && !isValidLegalId(raw);

  return (
    <>
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        dir="ltr"
        placeholder={placeholder ?? (digits === "fa" ? "۰۰۰۰۰۰۰۰۰۰۰" : "00000000000")}
        value={digits === "fa" ? toFaDigits(raw) : raw}
        onChange={(e) => {
          const next = onlyDigits(e.target.value).slice(0, 11);
          if (value === undefined) setInner(next);
          onValueChange?.(next, isValidLegalId(next));
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
