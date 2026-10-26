import { forwardRef, type ElementType, type HTMLAttributes } from "react";
import { cx } from "./cx.js";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** @default "article" */
  as?: ElementType;
  /** بدون سایه */
  flat?: boolean;
  /** کارت قابل‌کلیک؛ یک لینک یا دکمه با کلاس k-card__link داخلش بگذارید */
  interactive?: boolean;
}

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { as: Tag = "article", flat = false, interactive = false, className, ...rest },
  ref,
) {
  return <Tag ref={ref} className={cx("k-card", flat && "k-card--flat", interactive && "k-card--interactive", className)} {...rest} />;
});

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

export const CardHeader = part("header", "k-card__header", "CardHeader");
/** پیش‌فرض h3؛ با as سطح عنوان را با ساختار صفحه هماهنگ کنید */
export const CardTitle = part("h3", "k-card__title", "CardTitle");
export const CardDescription = part("p", "k-card__description", "CardDescription");
export const CardBody = part("div", "k-card__body", "CardBody");
export const CardFooter = part("footer", "k-card__footer", "CardFooter");
