import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "./cx.js";

export type BadgeTone = "neutral" | "brand" | "error" | "warning" | "success" | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** @default "neutral" */
  tone?: BadgeTone;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** نقطهٔ رنگی ابتدای متن */
  dot?: boolean;
  /** گوشهٔ کم به‌جای گرد */
  square?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = "neutral", size = "md", dot = false, square = false, className, children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx("k-badge", tone !== "neutral" && `k-badge--${tone}`, size !== "md" && `k-badge--${size}`, square && "k-badge--square", className)}
      {...rest}
    >
      {dot && <span className="k-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
});
