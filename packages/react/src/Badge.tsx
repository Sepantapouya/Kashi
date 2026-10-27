import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "./cx.js";

export type BadgeTone = "neutral" | "brand" | "error" | "warning" | "success" | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** @default "neutral" */
  tone?: BadgeTone;
  /** «soft» پس‌زمینهٔ کم‌رنگ، «solid» پررنگ، «outline» فقط حاشیه @default "soft" */
  variant?: "soft" | "solid" | "outline";
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** نقطهٔ رنگی ابتدای متن */
  dot?: boolean;
  /** آیکون ابتدای متن */
  icon?: ReactNode;
  /** گوشهٔ کم به‌جای گرد */
  square?: boolean;
  /** با دادن این تابع، دکمهٔ حذف نمایش داده می‌شود (مثل برچسب‌های فیلتر) */
  onRemove?: () => void;
  /** @default (متن) => «حذف {متن}» */
  removeLabel?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = "neutral", variant = "soft", size = "md", dot = false, icon, square = false, onRemove, removeLabel, className, children, ...rest },
  ref,
) {
  const label = removeLabel ?? (typeof children === "string" ? `حذف ${children}` : "حذف");
  return (
    <span
      ref={ref}
      data-tone={tone}
      data-variant={variant}
      className={cx(
        "k-badge",
        tone !== "neutral" && `k-badge--${tone}`,
        variant !== "soft" && `k-badge--${variant}`,
        size !== "md" && `k-badge--${size}`,
        square && "k-badge--square",
        onRemove && "k-badge--removable",
        className,
      )}
      {...rest}
    >
      {dot && <span className="k-badge__dot" aria-hidden="true" />}
      {icon && <span className="k-badge__icon" aria-hidden="true">{icon}</span>}
      {children}
      {onRemove && (
        <button type="button" className="k-badge__remove" aria-label={label} onClick={onRemove}>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true"><path d="m6 6 8 8M14 6l-8 8" /></svg>
        </button>
      )}
    </span>
  );
});
