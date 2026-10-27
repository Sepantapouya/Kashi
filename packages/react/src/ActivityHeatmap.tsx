import { JALALI_MONTHS, formatJalali, formatNumber, jalaliMonthLength, toGregorian, toISODate, toJalali } from "@kashi-ui/persian";
import { useRef, useState } from "react";
import { cx } from "./cx.js";
import { ChartTip } from "./Chart.js";

export interface ActivityHeatmapProps {
  /** تعداد فعالیت در هر روز؛ کلید تاریخ میلادی YYYY-MM-DD */
  data: Record<string, number>;
  /** سال شمسی @default سال جاری */
  year?: number;
  /** نام دسترس‌پذیر، مثل «فعالیت تیم در سال ۱۴۰۵» */
  label?: string;
  /** واحد در راهنما @default «فعالیت» */
  unit?: string;
  className?: string;
}

const WEEK = ["ش", "", "د", "", "چ", "", "ج"];

/** نقشهٔ فعالیت سالانه با ماه‌های شمسی؛ هفته از شنبه شروع می‌شود */
export function ActivityHeatmap({ data, year = toJalali(new Date()).jy, label, unit = "فعالیت", className }: ActivityHeatmapProps) {
  const days: { date: Date; value: number }[] = [];
  for (let m = 1; m <= 12; m++) for (let d = 1; d <= jalaliMonthLength(year, m); d++) {
    const date = toGregorian(year, m, d);
    days.push({ date, value: data[toISODate(date)] ?? 0 });
  }
  const max = Math.max(0, ...days.map((d) => d.value));
  const level = (v: number) => (v <= 0 || max === 0 ? 0 : Math.max(1, Math.ceil((v / max) * 4)));
  // شنبه سطر اول
  const row = (d: Date) => (d.getDay() + 1) % 7;
  const offset = row(days[0].date);
  const col = (i: number) => Math.floor((i + offset) / 7);
  const monthStarts = JALALI_MONTHS.map((name, m) => ({ name, col: col(days.findIndex((d) => toJalali(d.date).jm === m + 1)) }));
  const total = days.reduce((s, d) => s + d.value, 0);
  const monthly = JALALI_MONTHS.map((name, m) => ({ name, sum: days.filter((d) => toJalali(d.date).jm === m + 1).reduce((s, d) => s + d.value, 0) }));
  const box = useRef<HTMLElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number; i: number } | null>(null);
  const name = label ?? `${unit} در سال ${formatNumber(year, { digits: "fa" }).replace(/٬/g, "")}`;

  return (
    <figure ref={box} className={cx("k-heatmap", className)} style={{ margin: 0 }} onPointerLeave={() => setTip(null)}>
      <div className="k-heatmap__scroll">
        <div role="img" aria-label={`${name}: ${formatNumber(total)} ${unit}`}>
          <div className="k-heatmap__months" aria-hidden="true">
            {monthStarts.map((m) => <span key={m.name} style={{ gridColumn: m.col + 1 }}>{m.name}</span>)}
          </div>
          <div className="k-heatmap__body" aria-hidden="true">
            <div className="k-heatmap__days">{WEEK.map((w, i) => <span key={i}>{w}</span>)}</div>
            <div
              className="k-heatmap__grid"
              onPointerOver={(e) => {
                const cell = (e.target as HTMLElement).closest<HTMLElement>("[data-i]");
                if (!cell || !box.current) return setTip(null);
                const b = box.current.getBoundingClientRect(), r = cell.getBoundingClientRect();
                setTip({ x: r.left + r.width / 2 - b.left, y: r.top - b.top - 2, i: Number(cell.dataset.i) });
              }}
            >
              {Array.from({ length: offset }, (_, i) => <span key={`e${i}`} className="k-heatmap__cell" data-empty="" />)}
              {days.map((d, i) => (
                <span key={d.date.getTime()} className="k-heatmap__cell" data-l={level(d.value)} data-i={i} data-active={tip?.i === i ? "" : undefined} />
              ))}
            </div>
          </div>
        </div>
      </div>
      {tip && <ChartTip x={tip.x} y={tip.y} width={box.current?.clientWidth} title={formatJalali(days[tip.i].date, { style: "full" })} rows={[{ value: `${formatNumber(days[tip.i].value)} ${unit}` }]} />}
      <figcaption className="k-heatmap__foot">
        <span>{formatNumber(total)} {unit} در {formatNumber(year).replace(/٬/g, "")}</span>
        <span className="k-heatmap__scale" aria-hidden="true">کمتر {[0, 1, 2, 3, 4].map((l) => <span key={l} className="k-heatmap__cell" data-l={l} />)} بیشتر</span>
      </figcaption>
      <table className="k-sr-only">
        <caption>{name}، به تفکیک ماه</caption>
        <tbody>{monthly.map((m) => <tr key={m.name}><th scope="row">{m.name}</th><td>{formatNumber(m.sum)}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}
