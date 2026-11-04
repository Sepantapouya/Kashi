"use client";

import { forwardRef, useMemo, useState } from "react";
import { fixPersianText, toFaDigits } from "@kashi-ui/persian";
import { Button } from "./Button.js";
import { Textarea, type TextareaProps } from "./Input.js";
import { useKashi } from "./KashiProvider.js";

type Base = Omit<TextareaProps, "value" | "defaultValue" | "onChange">;

export interface PersianTextareaProps extends Base {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** تبدیل ارقام لاتین داخل متن فارسی @default true */
  fixDigits?: boolean;
  /** اصلاح خودکار هنگام خروج از فیلد @default false */
  fixOnBlur?: boolean;
  labels?: { fix?: string; clean?: string };
}

const KINDS = ["arabic", "zwnj", "punctuation", "digits", "spacing"] as const;

/** ناحیهٔ متن با ویرایش نگارشی فارسی: «ي/ك» عربی، نیم‌فاصله، ویرگول و علامت سؤال فارسی و ارقام */
export const PersianTextarea = forwardRef<HTMLTextAreaElement, PersianTextareaProps>(function PersianTextarea(
  { value, defaultValue = "", onValueChange, fixDigits = true, fixOnBlur = false, labels = {}, hint, onBlur, ...rest },
  ref,
) {
  const { messages: M, n } = useKashi();
  const { fix = M.textFix.fix, clean = M.textFix.clean } = labels;
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  const result = useMemo(() => fixPersianText(current, { digits: fixDigits }), [current, fixDigits]);
  const update = (next: string) => {
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };
  const summary = KINDS
    .filter((k) => result.fixes[k])
    .map((k) => `${n(result.fixes[k])} ${M.textFix[k]}`)
    .join(M.common.list);

  return (
    <Textarea
      ref={ref}
      value={current}
      onChange={(e) => update(e.target.value)}
      onBlur={(e) => {
        if (fixOnBlur && result.count) update(result.text);
        onBlur?.(e);
      }}
      hint={
        current.trim() ? (
          <span className="k-textfix" data-state={result.count ? "fix" : "clean"}>
            <span className="k-textfix__text">{result.count ? M.textFix.count(n(result.count), summary) : clean}</span>
            {result.count > 0 && <Button size="xs" variant="tertiary" onClick={() => update(result.text)}>{fix}</Button>}
          </span>
        ) : hint
      }
      {...rest}
    />
  );
});
