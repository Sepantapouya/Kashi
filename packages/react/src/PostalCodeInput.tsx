import { forwardRef, useState, type ReactNode } from "react";
import { formatPostalCode, isValidPostalCode } from "@kashi-ui/persian";
import { Input, type InputProps } from "./Input.js";
import { useDigitsInput } from "./useDigitsInput.js";
import { mergeRefs } from "./utils.js";

type Base = Omit<InputProps, "value" | "defaultValue" | "onChange" | "type" | "inputMode">;

export interface PostalCodeInputProps extends Base {
  /** ارقام لاتین، مثل "1193653471" */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, valid: boolean) => void;
  /** @default "fa" */
  digits?: "fa" | "latin";
  /** @default "کد پستی معتبر نیست." */
  invalidMessage?: ReactNode;
}

/** کد پستی ۱۰ رقمی با قالب ۱۲۳۴۵-۶۷۸۹۰ و بررسی قواعد کد پستی ایران */
export const PostalCodeInput = forwardRef<HTMLInputElement, PostalCodeInputProps>(function PostalCodeInput(
  { value, defaultValue, onValueChange, digits = "fa", invalidMessage = "کد پستی معتبر نیست.", error, name, onBlur, placeholder, ...rest },
  ref,
) {
  const { raw, shown, inputRef, handleChange } = useDigitsInput({ value, defaultValue, maxDigits: 10, format: formatPostalCode, digits });
  const [touched, setTouched] = useState(false);
  const showInvalid = raw.length > 0 && (touched || raw.length === 10) && !isValidPostalCode(raw);
  return (
    <>
      <Input
        ref={mergeRefs(ref, inputRef)}
        type="text"
        inputMode="numeric"
        autoComplete="postal-code"
        dir="ltr"
        placeholder={placeholder ?? (digits === "fa" ? "۱۲۳۴۵-۶۷۸۹۰" : "12345-67890")}
        value={shown}
        onChange={(e) => {
          const next = handleChange(e);
          onValueChange?.(next, isValidPostalCode(next));
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
