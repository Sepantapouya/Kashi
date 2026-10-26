import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "./cx.js";
import { isDev } from "./utils.js";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "link" | "danger" | "danger-secondary";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** @default "secondary" */
  variant?: ButtonVariant;
  /** @default "md" */
  size?: ButtonSize;
  /** نمایش اسپینر؛ دکمه فوکوس‌پذیر می‌ماند ولی کلیک نمی‌گیرد */
  loading?: boolean;
  /** متنی که صفحه‌خوان هنگام بارگذاری می‌خواند @default "در حال بارگذاری" */
  loadingLabel?: string;
  /** دکمهٔ تمام‌عرض */
  block?: boolean;
  /** دکمهٔ مربعی فقط‌آیکون — حتماً aria-label بدهید */
  iconOnly?: boolean;
  /** آیکون ابتدای متن (در RTL سمت راست) */
  iconStart?: ReactNode;
  /** آیکون انتهای متن (در RTL سمت چپ) */
  iconEnd?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "secondary",
    size = "md",
    loading = false,
    loadingLabel = "در حال بارگذاری",
    block = false,
    iconOnly = false,
    iconStart,
    iconEnd,
    disabled,
    type = "button",
    className,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  if (isDev() && iconOnly && !rest["aria-label"] && !rest["aria-labelledby"]) {
    console.warn("[kashi] <Button iconOnly> بدون aria-label برای صفحه‌خوان‌ها بی‌نام است.");
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      // در حالت loading از disabled بومی استفاده نمی‌کنیم تا فوکوس کیبورد از دست نرود
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={loading ? (e) => e.preventDefault() : onClick}
      className={cx(
        "k-btn",
        `k-btn--${variant}`,
        size !== "md" && `k-btn--${size}`,
        block && "k-btn--block",
        iconOnly && "k-btn--icon",
        className,
      )}
      {...rest}
    >
      {iconStart}
      {children}
      {iconEnd}
      {loading && (
        <span className="k-sr-only" role="status">
          {loadingLabel}
        </span>
      )}
    </button>
  );
});
