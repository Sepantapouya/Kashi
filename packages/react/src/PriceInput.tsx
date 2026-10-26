import { forwardRef, useState, type ReactNode } from "react";
import { formatNumber, numberToWords, toFaDigits } from "@kashi-ui/persian";
import { Input, type InputProps } from "./Input.js";
import { useDigitsInput } from "./useDigitsInput.js";
import { mergeRefs } from "./utils.js";

type Base = Omit<InputProps, "value" | "defaultValue" | "onChange" | "type" | "inputMode" | "addonEnd" | "min" | "max">;

export interface PriceInputProps extends Base {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  /** واحد پول کنار فیلد @default "تومان" */
  unit?: ReactNode;
  /** نمایش مبلغ به حروف زیر فیلد @default true */
  showWords?: boolean;
  /** @default "fa" */
  digits?: "fa" | "latin";
  min?: number;
  max?: number;
  /** پیام خطای بیرون از محدوده */
  rangeMessage?: (min?: number, max?: number) => ReactNode;
}

const toRaw = (n?: number | null) => (n === null || n === undefined ? undefined : String(Math.trunc(Math.abs(n))));

/** فیلد مبلغ: جداکنندهٔ هزارگان، واحد پول و نمایش مبلغ به حروف برای اطمینان کاربر */
export const PriceInput = forwardRef<HTMLInputElement, PriceInputProps>(function PriceInput(
  {
    value, defaultValue, onValueChange, unit = "تومان", showWords = true, digits = "fa", min, max,
    rangeMessage = (lo, hi) =>
      `مبلغ باید ${lo !== undefined ? `حداقل ${toFaDigits(formatNumber(lo))}` : ""}${lo !== undefined && hi !== undefined ? " و " : ""}${hi !== undefined ? `حداکثر ${toFaDigits(formatNumber(hi))}` : ""} باشد.`,
    error, hint, name, onBlur, placeholder, ...rest
  },
  ref,
) {
  const [touched, setTouched] = useState(false);
  const { raw, shown, inputRef, handleChange } = useDigitsInput({
    value: value === undefined ? undefined : (toRaw(value) ?? ""),
    defaultValue: toRaw(defaultValue),
    maxDigits: 15,
    normalize: (d) => d.replace(/^0+(?=\d)/, ""),
    format: (d) => (d ? formatNumber(d, { digits: "latin" }).replace(/,/g, "٬") : ""),
    digits,
  });
  const n = raw ? Number(raw) : null;
  const outOfRange = n !== null && ((min !== undefined && n < min) || (max !== undefined && n > max));
  const words = showWords && n !== null ? `${numberToWords(n)}${typeof unit === "string" ? ` ${unit}` : ""}` : null;

  return (
    <>
      <Input
        ref={mergeRefs(ref, inputRef)}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        dir="ltr"
        placeholder={placeholder ?? (digits === "fa" ? "۰" : "0")}
        value={shown}
        onChange={(e) => {
          const next = handleChange(e);
          onValueChange?.(next ? Number(next) : null);
        }}
        onBlur={(e) => {
          setTouched(true);
          onBlur?.(e);
        }}
        addonEnd={unit ? <span className="k-input__meta">{unit}</span> : undefined}
        hint={words ?? hint}
        error={error ?? (touched && outOfRange ? rangeMessage(min, max) : undefined)}
        {...rest}
      />
      {name && <input type="hidden" name={name} value={raw} />}
    </>
  );
});
