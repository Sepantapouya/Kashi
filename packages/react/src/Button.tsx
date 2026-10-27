import { forwardRef, type ButtonHTMLAttributes, type ElementType, type MouseEvent, type ReactNode } from "react";
import { cx } from "./cx.js";
import { isDev } from "./utils.js";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "link" | "danger" | "danger-secondary";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  /** @default "secondary" */
  variant?: ButtonVariant;
  /** @default "md" */
  size?: ButtonSize;
  /** «pill» کاملاً گرد، «square» گوشهٔ کم @default "default" */
  shape?: "default" | "pill" | "square";
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
  /** با href به‌صورت لینک (<a>) رندر می‌شود */
  href?: string;
  target?: string;
  rel?: string;
  /** عنصر یا کامپوننت دلخواه، مثل Link در Next.js: as={Link} */
  as?: ElementType;
  type?: "button" | "submit" | "reset";
  /** بقیهٔ props برای کامپوننت as، مثل prefetch */
  [key: `data-${string}`]: unknown;
}

export const Button = forwardRef<HTMLElement, ButtonProps>(function Button(
  {
    variant = "secondary", size = "md", shape = "default", loading = false, loadingLabel = "در حال بارگذاری",
    block = false, iconOnly = false, iconStart, iconEnd, disabled, type = "button", href, as, className, children, onClick, ...rest
  },
  ref,
) {
  if (isDev() && iconOnly && !rest["aria-label"] && !rest["aria-labelledby"]) {
    console.warn("[kashi] <Button iconOnly> بدون aria-label برای صفحه‌خوان‌ها بی‌نام است.");
  }

  const Tag: ElementType = as ?? (href ? "a" : "button");
  const isNativeButton = Tag === "button";
  const inactive = loading || (!isNativeButton && disabled);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (inactive) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <Tag
      ref={ref}
      {...(isNativeButton ? { type, disabled } : { href: inactive ? undefined : href, role: href ? undefined : "button" })}
      // در حالت loading از disabled بومی استفاده نمی‌کنیم تا فوکوس کیبورد از دست نرود
      aria-disabled={inactive || undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
      data-variant={variant}
      data-size={size}
      className={cx(
        "k-btn",
        `k-btn--${variant}`,
        size !== "md" && `k-btn--${size}`,
        shape !== "default" && `k-btn--${shape}`,
        block && "k-btn--block",
        iconOnly && "k-btn--icon",
        className,
      )}
      {...rest}
    >
      {iconStart}
      {children}
      {iconEnd}
      {loading && <span className="k-sr-only" role="status">{loadingLabel}</span>}
    </Tag>
  );
});
