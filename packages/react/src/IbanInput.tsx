import { forwardRef, useId, useState, type ReactNode } from "react";
import { formatIban, getBankByIban, isValidIban } from "@kashi-ui/persian";
import { BankBadge } from "./BankBadge.js";
import { Input, type InputProps } from "./Input.js";
import { useDigitsInput } from "./useDigitsInput.js";
import { mergeRefs } from "./utils.js";

type Base = Omit<InputProps, "value" | "defaultValue" | "onChange" | "type" | "inputMode" | "addonEnd">;

export interface IbanInputProps extends Base {
  /** مقدار کنترل‌شده: «IR» + ۲۴ رقم یا فقط ۲۴ رقم */
  value?: string;
  defaultValue?: string;
  /** با هر تغییر: شبای کامل «IR…» بدون فاصله، معتبر بودن و نام بانک */
  onValueChange?: (value: string, valid: boolean, bank: string | null) => void;
  /** شبا معمولاً با ارقام لاتین نوشته می‌شود @default "latin" */
  digits?: "fa" | "latin";
  /** @default true */
  showBank?: boolean;
  /** @default true */
  showBankLogo?: boolean;
  /** @default "شماره شبا معتبر نیست." */
  invalidMessage?: ReactNode;
}

const ibanOf = (d: string) => (d ? `IR${d}` : "");

/** فیلد شماره شبا: IR خودکار، گروه‌بندی، تشخیص بانک با لوگو و بررسی رقم‌های کنترل */
export const IbanInput = forwardRef<HTMLInputElement, IbanInputProps>(function IbanInput(
  { value, defaultValue, onValueChange, digits = "latin", showBank = true, showBankLogo = true, invalidMessage = "شماره شبا معتبر نیست.", error, name, id, onBlur, placeholder, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [touched, setTouched] = useState(false);
  const strip = (v?: string) => v?.replace(/^\s*IR/i, "");
  const { raw, shown, inputRef, handleChange } = useDigitsInput({
    value: strip(value),
    defaultValue: strip(defaultValue),
    maxDigits: 24,
    format: (d) => formatIban(d),
    digits,
  });
  const bank = showBank ? getBankByIban(raw) : null;
  const showInvalid = raw.length > 0 && (touched || raw.length === 24) && !isValidIban(raw);
  const bankId = `${inputId}-bank`;

  return (
    <>
      <Input
        ref={mergeRefs(ref, inputRef)}
        id={inputId}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        dir="ltr"
        placeholder={placeholder ?? "IR00 0000 0000 0000 0000 0000 00"}
        value={shown}
        onChange={(e) => {
          // «IR» تایپ‌شده یا چسبانده‌شده حذف می‌شود و فقط ارقام می‌مانند
          const next = handleChange(e);
          onValueChange?.(ibanOf(next), isValidIban(next), getBankByIban(next)?.name ?? null);
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
      {name && <input type="hidden" name={name} value={ibanOf(raw)} />}
    </>
  );
});
