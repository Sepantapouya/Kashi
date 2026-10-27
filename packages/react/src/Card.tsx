import { forwardRef, type ElementType, type HTMLAttributes, type ImgHTMLAttributes, type ReactNode } from "react";
import { cx } from "./cx.js";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** @default "article" */
  as?: ElementType;
  /** بدون سایه */
  flat?: boolean;
  /** کارت قابل‌کلیک؛ یک لینک یا دکمه با کلاس k-card__link داخلش بگذارید */
  interactive?: boolean;
  /** «outlined» حاشیه و سایهٔ کم، «elevated» سایهٔ بیشتر، «filled» پس‌زمینهٔ خاکستری بدون سایه @default "outlined" */
  variant?: "outlined" | "elevated" | "filled";
  /** فاصلهٔ داخلی بخش‌ها @default "md" */
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { as: Tag = "article", flat = false, interactive = false, variant = "outlined", padding = "md", className, ...rest },
  ref,
) {
  return (
    <Tag
      ref={ref}
      data-variant={variant}
      className={cx("k-card", flat && "k-card--flat", interactive && "k-card--interactive", variant !== "outlined" && `k-card--${variant}`, padding !== "md" && `k-card--pad-${padding}`, className)}
      {...rest}
    />
  );
});

export interface CardHeaderProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  /** دکمه یا منو در انتهای سربرگ */
  actions?: ReactNode;
}

/** سربرگ کارت؛ با actions، عنوان و توضیح در یک ستون و عمل‌ها در انتها قرار می‌گیرند */
export const CardHeader = forwardRef<HTMLElement, CardHeaderProps>(function CardHeader({ as: Tag = "header", actions, className, children, ...rest }, ref) {
  if (!actions) return <Tag ref={ref} className={cx("k-card__header", className)} {...rest}>{children}</Tag>;
  return (
    <Tag ref={ref} className={cx("k-card__header", "k-card__header--actions", className)} {...rest}>
      <div className="k-card__heading">{children}</div>
      <div className="k-card__actions">{actions}</div>
    </Tag>
  );
});

export interface CardMediaProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** نسبت ابعاد، مثل "16 / 9" @default "16 / 9" */
  ratio?: string;
}

/** تصویر کارت؛ alt را فراموش نکنید (برای تصویر تزئینی alt="") */
export function CardMedia({ ratio = "16 / 9", className, style, ...rest }: CardMediaProps) {
  return <img className={cx("k-card__media", className)} style={{ aspectRatio: ratio, ...style }} {...rest} />;
}

const part = (tag: ElementType, base: string, name: string) => {
  const Part = forwardRef<HTMLElement, HTMLAttributes<HTMLElement> & { as?: ElementType }>(function Part(
    { as: Tag = tag, className, ...rest },
    ref,
  ) {
    return <Tag ref={ref} className={cx(base, className)} {...rest} />;
  });
  Part.displayName = name;
  return Part;
};

/** پیش‌فرض h3؛ با as سطح عنوان را با ساختار صفحه هماهنگ کنید */
export const CardTitle = part("h3", "k-card__title", "CardTitle");
export const CardDescription = part("p", "k-card__description", "CardDescription");
export const CardBody = part("div", "k-card__body", "CardBody");
export const CardFooter = part("footer", "k-card__footer", "CardFooter");
