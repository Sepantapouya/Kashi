import { forwardRef, useId, useState, type ReactNode } from "react";
import { formatCardNumber, getBankByCard, isValidCardNumber } from "@kashi-ui/persian";
import { BankBadge } from "./BankBadge.js";
import { Input, type InputProps } from "./Input.js";
import { useDigitsInput } from "./useDigitsInput.js";
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
  /** نمایش لوگوی بانک (فقط هنگام نیاز بارگذاری می‌شود) @default true */
  showBankLogo?: boolean;
  /** @default "شماره کارت معتبر نیست." */
  invalidMessage?: ReactNode;
}

/** فیلد شماره کارت بانکی: گروه‌بندی چهارتایی، تشخیص بانک با لوگو و بررسی Luhn */
export const CardNumberInput = forwardRef<HTMLInputElement, CardNumberInputProps>(function CardNumberInput(
  { value, defaultValue, onValueChange, digits = "fa", showBank = true, showBankLogo = true, invalidMessage = "شماره کارت معتبر نیست.", error, name, id, onBlur, placeholder, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [touched, setTouched] = useState(false);
  const { raw, shown, inputRef, handleChange } = useDigitsInput({ value, defaultValue, maxDigits: 16, format: formatCardNumber, digits });
  const bank = showBank ? getBankByCard(raw) : null;
  const showInvalid = raw.length > 0 && (touched || raw.length === 16) && !isValidCardNumber(raw);
  const bankId = `${inputId}-bank`;

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
          const next = handleChange(e);
          onValueChange?.(next, isValidCardNumber(next), getBankByCard(next)?.name ?? null);
        }}
        onBlur={(e) => {
          setTouched(true);
          onBlur?.(e);
        }}
        addonEnd={bank ? <BankBadge bank={bank} id={bankId} showLogo={showBankLogo} /> : undefined}
        aria-describedby={bank ? bankId : undefined}
        error={error ?? (showInvalid ? invalidMessage : undefined)}
        {...rest}
      />
      {name && <input type="hidden" name={name} value={raw} />}
    </>
  );
});
