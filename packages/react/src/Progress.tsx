import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { toFaDigits } from "@kashi-ui/persian";
import { cx } from "./cx.js";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** مقدار؛ بدون آن نوار «نامعین» است */
  value?: number;
  /** @default 100 */
  max?: number;
  /** برچسب بالای نوار؛ اگر نمی‌دهید aria-label بدهید */
  label?: ReactNode;
  /** نمایش درصد کنار برچسب */
  showValue?: boolean;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  tone?: "brand" | "success" | "warning" | "error";
}

export function Progress({ value, max = 100, label, showValue, size = "md", tone = "brand", className, "aria-label": ariaLabel, ...rest }: ProgressProps) {
  const pct = value === undefined ? undefined : Math.max(0, Math.min(100, (value / max) * 100));
  const text = pct === undefined ? undefined : `${toFaDigits(Math.round(pct))}٪`;
  const bar = (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={text}
      aria-label={ariaLabel ?? (typeof label === "string" ? label : undefined)}
      className={cx("k-progress", size !== "md" && `k-progress--${size}`, tone !== "brand" && `k-progress--${tone}`, !label && className)}
      {...rest}
    >
      <div className="k-progress__bar" style={pct === undefined ? undefined : ({ "--k-value": `${pct}%` } as CSSProperties)} />
    </div>
  );
  if (!label) return bar;
  return (
    <div className={cx("k-progress-field", className)}>
      <div className="k-progress-field__head" aria-hidden="true">
        <span className="k-progress-field__label">{label}</span>
        {showValue && text && <span className="k-progress-field__value">{text}</span>}
      </div>
      {bar}
    </div>
  );
}

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  /** @default "در حال بارگذاری" */
  label?: string;
  size?: "sm" | "md" | "lg";
}

/** اسپینر با متن صفحه‌خوان */
export function Spinner({ label = "در حال بارگذاری", size = "md", className, ...rest }: SpinnerProps) {
  return (
    <span role="status" className={className} {...rest}>
      <span className={cx("k-spinner", size !== "md" && `k-spinner--${size}`)} aria-hidden="true" />
      <span className="k-sr-only">{label}</span>
    </span>
  );
}
