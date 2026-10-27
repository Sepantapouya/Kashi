import type { ReactNode } from "react";
import { cx } from "./cx.js";

export interface BreadcrumbItem { label: ReactNode; href?: string; icon?: ReactNode }

export interface BreadcrumbProps {
  /** آخرین مورد صفحهٔ فعلی است */
  items: BreadcrumbItem[];
  /** @default "مسیر" */
  label?: string;
  className?: string;
}

/** مسیر صفحه؛ آخرین مورد با aria-current="page" مشخص می‌شود */
export function Breadcrumb({ items, label = "مسیر", className }: BreadcrumbProps) {
  return (
    <nav className={cx("k-breadcrumb", className)} aria-label={label}>
      <ol>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          const content = <>{item.icon}{item.label}</>;
          return (
            <li key={i}>
              {last || !item.href ? <span aria-current={last ? "page" : undefined}>{content}</span> : <a href={item.href}>{content}</a>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
