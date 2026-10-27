import { forwardRef, useId, useState, type ReactNode } from "react";
import { formatLandline, getLandlineProvince, isValidLandline, normalizeLandline } from "@kashi-ui/persian";
import { Input, type InputProps } from "./Input.js";
import { useDigitsInput } from "./useDigitsInput.js";
import { mergeRefs } from "./utils.js";

type Base = Omit<InputProps, "value" | "defaultValue" | "onChange" | "type" | "inputMode" | "addonEnd">;

export interface LandlineInputProps extends Base {
  /** مثل "02188776655" یا "+982188776655" */
  value?: string;
  defaultValue?: string;
  /** شماره به شکل ۰۲۱xxxxxxxx، معتبر بودن و نام استان */
  onValueChange?: (value: string, valid: boolean, province: string | null) => void;
  /** @default "fa" */
  digits?: "fa" | "latin";
  /** نمایش نام استان از روی پیش‌شماره @default true */
  showProvince?: boolean;
  /** @default "شمارهٔ تلفن ثابت معتبر نیست." */
  invalidMessage?: ReactNode;
}

/** تلفن ثابت با پیش‌شماره: +98 را به ۰ تبدیل می‌کند، گروه‌بندی و نام استان را نشان می‌دهد */
export const LandlineInput = forwardRef<HTMLInputElement, LandlineInputProps>(function LandlineInput(
  { value, defaultValue, onValueChange, digits = "fa", showProvince = true, invalidMessage = "شمارهٔ تلفن ثابت معتبر نیست.", error, name, id, onBlur, placeholder, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [touched, setTouched] = useState(false);
  const { raw, shown, inputRef, handleChange } = useDigitsInput({ value, defaultValue, maxDigits: 11, normalize: normalizeLandline, format: formatLandline, digits });
  const province = showProvince ? getLandlineProvince(raw) : null;
  const showInvalid = raw.length > 0 && (touched || raw.length === 11) && !isValidLandline(raw);
  const provId = `${inputId}-province`;
  return (
    <>
      <Input
        ref={mergeRefs(ref, inputRef)}
        id={inputId}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        dir="ltr"
        placeholder={placeholder ?? (digits === "fa" ? "۰۲۱ ۸۸۷۷ ۶۶۵۵" : "021 8877 6655")}
        value={shown}
        onChange={(e) => {
          const next = handleChange(e);
          onValueChange?.(next, isValidLandline(next), getLandlineProvince(next));
        }}
        onBlur={(e) => {
          setTouched(true);
          onBlur?.(e);
        }}
        addonEnd={province ? <span className="k-input__meta" id={provId}>{province}</span> : undefined}
        aria-describedby={province ? provId : undefined}
        error={error ?? (showInvalid ? invalidMessage : undefined)}
        {...rest}
      />
      {name && <input type="hidden" name={name} value={raw} />}
    </>
  );
});
