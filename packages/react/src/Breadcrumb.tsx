import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "./cx.js";

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
  icon?: ReactNode;
  /** فقط آیکون نمایش داده شود؛ برچسب برای صفحه‌خوان می‌ماند (مثل «خانه») */
  hideLabel?: boolean;
}

export interface BreadcrumbProps {
  /** آخرین مورد صفحهٔ فعلی است */
  items: BreadcrumbItem[];
  /** اگر موارد بیشتر بود، وسط مسیر به «…» جمع می‌شود */
  maxItems?: number;
  /** @default "chevron" */
  separator?: "chevron" | "slash";
  /** @default "مسیر" */
  label?: string;
  /** @default "نمایش مسیر کامل" */
  expandLabel?: string;
  className?: string;
}

/** مسیر صفحه؛ آخرین مورد با aria-current="page" مشخص می‌شود و مسیرهای بلند جمع می‌شوند */
export function Breadcrumb({ items, maxItems, separator = "chevron", label = "مسیر", expandLabel = "نمایش مسیر کامل", className }: BreadcrumbProps) {
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);
  const justExpanded = useRef(false);
  // دکمهٔ «…» پس از باز شدن حذف می‌شود؛ فوکوس به اولین مورد تازه‌نمایان می‌رود تا گم نشود
  useEffect(() => {
    if (!justExpanded.current) return;
    justExpanded.current = false;
    listRef.current?.querySelectorAll<HTMLElement>(".k-breadcrumb__link")[1]?.focus();
  }, [expanded]);
  const collapse = !expanded && maxItems !== undefined && maxItems >= 2 && items.length > maxItems;
  // اولی + «…» + آخرین‌ها
  const visible: (BreadcrumbItem | "ellipsis")[] = collapse
    ? [items[0], "ellipsis", ...items.slice(items.length - (maxItems! - 1))]
    : items;

  return (
    <nav className={cx("k-breadcrumb", separator === "slash" && "k-breadcrumb--slash", className)} aria-label={label}>
      <ol ref={listRef}>
        {visible.map((item, i) => {
          if (item === "ellipsis") {
            return (
              <li key="ellipsis">
                <button type="button" className="k-breadcrumb__link" aria-label={expandLabel} onClick={() => { justExpanded.current = true; setExpanded(true); }}>…</button>
              </li>
            );
          }
          const last = item === items[items.length - 1];
          const iconOnly = !!item.icon && item.hideLabel;
          const cls = cx("k-breadcrumb__link", iconOnly && "k-breadcrumb__link--icon");
          const title = typeof item.label === "string" && !iconOnly ? item.label : undefined;
          const content = (
            <>
              {item.icon}
              <span className={iconOnly ? "k-sr-only" : "k-breadcrumb__text"}>{item.label}</span>
            </>
          );
          return (
            <li key={i}>
              {last || !item.href ? (
                <span className={cls} aria-current={last ? "page" : undefined} title={title}>{content}</span>
              ) : (
                <a className={cls} href={item.href} title={title}>{content}</a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
