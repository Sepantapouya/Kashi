import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./cx.js";
import { RelativeTime } from "./RelativeTime.js";

export interface TimelineItem {
  id?: string | number;
  title: ReactNode;
  /** Date به شکل نسبی («۵ دقیقه پیش») نمایش داده می‌شود */
  time?: Date | ReactNode;
  /** آیکون یا آواتار داخل نشانگر */
  icon?: ReactNode;
  tone?: "neutral" | "brand" | "success" | "error";
  /** متن یا محتوای اضافه در کادر زیر عنوان، مثل متن کامنت */
  content?: ReactNode;
}

export interface TimelineProps extends HTMLAttributes<HTMLOListElement> {
  items: TimelineItem[];
  /** @default "fa" */
  digits?: "fa" | "latin";
}

const Dot = () => <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="3" fill="currentColor" /></svg>;

/** خط زمانی رویدادها و فعالیت‌ها، به ترتیب داده‌شده */
export function Timeline({ items, digits = "fa", className, ...rest }: TimelineProps) {
  return (
    <ol className={cx("k-timeline", className)} {...rest}>
      {items.map((it, i) => (
        <li key={it.id ?? i} className="k-timeline__item" data-tone={it.tone && it.tone !== "neutral" ? it.tone : undefined}>
          <span className="k-timeline__marker" aria-hidden="true">{it.icon ?? <Dot />}</span>
          <div className="k-timeline__body">
            <p className="k-timeline__title">{it.title}</p>
            {it.time !== undefined && (
              <span className="k-timeline__time">{it.time instanceof Date ? <RelativeTime date={it.time} digits={digits} /> : it.time}</span>
            )}
            {it.content && <div className="k-timeline__content">{it.content}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}
