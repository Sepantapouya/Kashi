import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { toFaDigits } from "@kashi-ui/persian";
import { cx } from "./cx.js";

export interface StatCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  label: ReactNode;
  value: ReactNode;
  /** واحد کوچک کنار عدد، مثل «تومان» یا «نفر» */
  unit?: ReactNode;
  icon?: ReactNode;
  /** درصد تغییر؛ مثبت افزایش، منفی کاهش */
  change?: number;
  /** برای شاخص‌هایی که کاهش در آن‌ها خوب است، مثل نرخ خطا */
  invertTrend?: boolean;
  /** متن کنار روند، مثل «نسبت به ماه قبل» */
  caption?: ReactNode;
  /** نمودار کوچک یا هر محتوای دیگر در پایین کارت */
  children?: ReactNode;
  labels?: { up?: string; down?: string; flat?: string };
}

const Arrow = ({ dir }: { dir: "up" | "down" }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {dir === "up" ? <path d="M10 15V5m0 0-4 4m4-4 4 4" /> : <path d="M10 5v10m0 0-4-4m4 4 4-4" />}
  </svg>
);

/** کارت شاخص کلیدی (KPI) با روند؛ صفحه‌خوان روند را به شکل «۱۲٪ افزایش» می‌خواند */
export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(function StatCard(
  { label, value, unit, icon, change, invertTrend, caption, children, labels = {}, className, ...rest },
  ref,
) {
  const { up = "افزایش", down = "کاهش", flat = "بدون تغییر" } = labels;
  const dir = change === undefined ? null : change > 0 ? "up" : change < 0 ? "down" : "flat";
  // رنگ بر اساس خوب یا بد بودن، نه جهت
  const good = dir === "flat" ? "flat" : (dir === "up") !== Boolean(invertTrend) ? "up" : "down";
  const pct = change === undefined ? "" : `${toFaDigits(Math.abs(Math.round(change * 10) / 10)).replace(".", "٫")}٪`;

  return (
    <div ref={ref} className={cx("k-stat", className)} {...rest}>
      <div className="k-stat__head">
        {icon && <span className="k-stat__icon" aria-hidden="true">{icon}</span>}
        <p className="k-stat__label">{label}</p>
      </div>
      <p className="k-stat__value">
        <span>{value}</span>
        {unit && <span className="k-stat__unit">{unit}</span>}
      </p>
      {(dir || caption) && (
        <div className="k-stat__foot">
          {dir && (
            <span className={`k-trend k-trend--${good}`}>
              {dir !== "flat" && <Arrow dir={dir} />}
              <span aria-hidden="true">{dir === "flat" ? flat : pct}</span>
              <span className="k-sr-only">{dir === "flat" ? flat : `${pct} ${dir === "up" ? up : down}`}</span>
            </span>
          )}
          {caption && <span>{caption}</span>}
        </div>
      )}
      {children && <div className="k-stat__chart">{children}</div>}
    </div>
  );
});

export function StatGrid({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("k-stat-grid", className)} {...rest} />;
}
