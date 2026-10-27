import type { ReactNode } from "react";
import { formatNumber, toFaDigits } from "@kashi-ui/persian";
import { cx } from "./cx.js";

export interface MeterProps {
  label: ReactNode;
  value: number;
  /** @default 100 */
  max?: number;
  /** از این مقدار به بعد هشدار (زرد) @default ۸۰٪ max */
  warning?: number;
  /** از این مقدار به بعد بحرانی (قرمز) @default ۹۵٪ max */
  critical?: number;
  /** قالب مقدار، مثل «۴٫۲ گیگابایت» */
  format?: (n: number) => string;
  className?: string;
  labels?: { ok?: string; warning?: string; critical?: string; of?: string };
}

const Icon = ({ d }: { d: string }) => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;

/** سنجهٔ یک مقدار در برابر سقف، مثل فضای ذخیره یا سهمیهٔ پیامک؛ وضعیت با متن و آیکون، نه فقط رنگ */
export function Meter({ label, value, max = 100, warning = max * 0.8, critical = max * 0.95, format = (n) => formatNumber(n), className, labels = {} }: MeterProps) {
  const { ok = "در محدودهٔ مجاز", warning: warnText = "نزدیک به سقف", critical: critText = "سقف تقریباً پر شده", of = "از" } = labels;
  const v = Math.min(max, Math.max(0, value));
  const status = v >= critical ? "critical" : v >= warning ? "warning" : "ok";
  const pct = Math.round((v / max) * 100);
  const text = { ok, warning: warnText, critical: critText }[status];
  return (
    <div className={cx("k-meter", className)} data-status={status}>
      <div className="k-meter__head">
        <span className="k-meter__label">{label}</span>
        <span className="k-meter__value">{format(v)} <span>{of} {format(max)}</span></span>
      </div>
      <div
        className="k-meter__track"
        role="meter"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={`${format(v)} ${of} ${format(max)}، ${toFaDigits(pct)}٪، ${text}`}
        aria-label={typeof label === "string" ? label : undefined}
      >
        <span className="k-meter__fill" style={{ inlineSize: `${pct}%` }} />
        <span className="k-meter__mark" style={{ insetInlineStart: `${(warning / max) * 100}%` }} aria-hidden="true" />
      </div>
      <p className="k-meter__status" aria-hidden="true">
        <Icon d={status === "ok" ? "m5 10.5 3.2 3L15 7" : "M10 3 2.5 16.5h15ZM10 8v4M10 14.5h.01"} />
        {text} · {toFaDigits(pct)}٪
      </p>
    </div>
  );
}
