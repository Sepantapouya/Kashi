"use client";

import { forwardRef, useRef, useState, type ReactNode } from "react";
import { fixKeyboardLayout, looksLikeWrongLayout } from "@kashi-ui/persian";
import { Input, type InputProps } from "./Input.js";
import { mergeRefs } from "./utils.js";
import { useKashi } from "./KashiProvider.js";

type Base = Omit<InputProps, "value" | "defaultValue" | "onChange">;

export interface KeyboardFixInputProps extends Base {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** "auto": فقط وقتی متن مشکوک است (looksLikeWrongLayout) — "always": برای هر متن لاتین @default "auto" */
  suggest?: "auto" | "always";
  /** متن پیشنهاد؛ fixed متن تبدیل‌شده است @default منظورتان «…» بود؟ */
  renderSuggestion?: (fixed: string, apply: () => void) => ReactNode;
}

/**
 * فیلدی که اگر کاربر فارسی را با صفحه‌کلید انگلیسی تایپ کرده باشد («sghl»)، شکل درست («سلام») را پیشنهاد می‌دهد.
 * مناسب جستجو و فرم‌هایی که کاربر زبان صفحه‌کلید را عوض نکرده است.
 */
export const KeyboardFixInput = forwardRef<HTMLInputElement, KeyboardFixInputProps>(function KeyboardFixInput(
  { value, defaultValue = "", onValueChange, suggest = "auto", renderSuggestion, hint, ...rest },
  ref,
) {
  const { messages: M, locale } = useKashi();
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  const el = useRef<HTMLInputElement>(null);
  const latin = /[a-z]/i.test(current) && !/[؀-ۿ]/.test(current);
  const show = suggest === "always" ? latin : looksLikeWrongLayout(current);
  const fixed = show ? fixKeyboardLayout(current) : "";
  const update = (next: string) => {
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };
  const apply = () => {
    update(fixed);
    el.current?.focus();
  };

  return (
    <Input
      ref={mergeRefs(ref, el)}
      dir="auto"
      value={current}
      onChange={(e) => update(e.target.value)}
      hint={
        show ? (
          <span className="k-kbfix" role="status">
            {renderSuggestion ? renderSuggestion(fixed, apply) : <>{M.keyboardFix.before} <button type="button" className="k-kbfix__btn" onClick={apply}>«{fixed}»</button>{locale === "en" ? "" : " "}{M.keyboardFix.after}</>}
          </span>
        ) : hint
      }
      {...rest}
    />
  );
});
