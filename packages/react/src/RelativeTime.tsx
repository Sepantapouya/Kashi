import { useEffect, useState, type HTMLAttributes } from "react";
import { formatJalali, formatRelative } from "@kashi-ui/persian";

export interface RelativeTimeProps extends Omit<HTMLAttributes<HTMLTimeElement>, "children"> {
  date: Date;
  /** @default "fa" */
  digits?: "fa" | "latin";
  /** فاصلهٔ به‌روزرسانی بر حسب میلی‌ثانیه @default 60000 */
  refresh?: number;
}

/** «۵ دقیقه پیش» در یک <time> معنایی؛ تاریخ کامل شمسی در title و برای صفحه‌خوان در دسترس است */
export function RelativeTime({ date, digits = "fa", refresh = 60_000, ...rest }: RelativeTimeProps) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), refresh);
    return () => clearInterval(t);
  }, [refresh]);
  return (
    <time dateTime={date.toISOString()} title={formatJalali(date, { style: "full", digits })} {...rest}>
      {formatRelative(date, { now, digits })}
    </time>
  );
}
