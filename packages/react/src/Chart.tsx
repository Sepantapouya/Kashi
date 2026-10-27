import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { formatNumber } from "@kashi-ui/persian";
import { cx } from "./cx.js";

const fmtDefault = (n: number) => formatNumber(Math.round(n));
/** عدد کوتاه برای محور: ۱٬۲۰۰٬۰۰۰ ← ۱٫۲ م */
const compact = (n: number) => {
  const a = Math.abs(n);
  const fa = (x: number, u: string) => `${formatNumber(Math.round(x * 10) / 10).replace(".", "٫")}${u}`;
  if (a >= 1e9) return fa(n / 1e9, " میلیارد");
  if (a >= 1e6) return fa(n / 1e6, " م");
  if (a >= 1e3) return fa(n / 1e3, " هزار");
  return formatNumber(n);
};
/** گام‌های گرد محور: ۰، ۲۵، ۵۰… */
function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw)!;
  return Array.from({ length: Math.ceil(max / step) + 1 }, (_, i) => i * step);
}

export interface TipRow { name?: string; value: string; color?: string }
/** راهنمای شناور مشترک نمودارها؛ x و y نسبت به ظرف نمودار */
export function ChartTip({ x, y, title, rows, width }: { x: number; y: number; title?: ReactNode; rows: TipRow[]; width?: number }) {
  // داخل ظرف بماند
  const cx = width ? Math.min(Math.max(x, 80), width - 80) : x;
  return (
    <div className="k-chart__tip" style={{ left: cx, top: y }} aria-hidden="true">
      {title && <span className="k-chart__tip-title">{title}</span>}
      {rows.map((r, i) => (
        <span key={i} className="k-chart__tip-row" style={r.color ? ({ "--_c": r.color } as CSSProperties) : undefined}>
          {r.name !== undefined && <span>{r.color && <i />}{r.name}</span>}
          <strong>{r.value}</strong>
        </span>
      ))}
    </div>
  );
}

type Tip = { x: number; y: number; i: number } | null;
/** موقعیت راهنما بالای یک عنصر، نسبت به ظرف */
const tipAt = (el: HTMLElement, box: HTMLElement | null, i: number, anchor?: HTMLElement | null): Tip => {
  if (!box) return null;
  const b = box.getBoundingClientRect();
  const r = (anchor ?? el).getBoundingClientRect();
  return { x: r.left + r.width / 2 - b.left, y: r.top - b.top, i };
};

/** جدول هم‌ارز برای صفحه‌خوان و چاپ */
function DataTable({ caption, labels, series, format }: { caption: string; labels: string[]; series: { name: string; values: number[] }[]; format: (n: number) => string }) {
  return (
    <table className="k-sr-only">
      <caption>{caption}</caption>
      <thead><tr><th scope="col">دوره</th>{series.map((s) => <th key={s.name} scope="col">{s.name}</th>)}</tr></thead>
      <tbody>{labels.map((l, i) => <tr key={l}><th scope="row">{l}</th>{series.map((s) => <td key={s.name}>{format(s.values[i])}</td>)}</tr>)}</tbody>
    </table>
  );
}

export interface BarChartProps {
  /** عنوان نمودار؛ نام دسترس‌پذیر هم هست */
  title: string;
  /** یک سری */
  data?: { label: string; value: number }[];
  /** یا چند سری روی هم (ستون انباشته)، حداکثر چهار؛ با labels */
  series?: LineSeries[];
  labels?: string[];
  /** قالب مقدار در راهنما و برچسب @default ارقام فارسی با جداکننده */
  format?: (n: number) => string;
  /** برچسب مقدار روی بلندترین ستون @default true */
  labelMax?: boolean;
  height?: string;
  className?: string;
}

/** نمودار ستونی؛ تک‌سری یا انباشته تا چهار سری. با موس یا Tab روی هر ستون مقدار دقیق نمایش داده می‌شود */
export function BarChart({ title, data, series, labels, format = fmtDefault, labelMax = true, height, className }: BarChartProps) {
  const id = useId();
  const stacked = series?.slice(0, 4);
  const cats = stacked ? labels ?? [] : (data ?? []).map((d) => d.label);
  const totals = cats.map((_, i) => (stacked ? stacked.reduce((n, s) => n + (s.values[i] ?? 0), 0) : data![i].value));
  const max = Math.max(0, ...totals);
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1] || 1;
  const maxIndex = totals.indexOf(max);
  const color = (i: number) => ({ "--_c": `var(--k-chart-${i + 1})` }) as CSSProperties;
  const describe = (i: number) =>
    stacked ? `${cats[i]}: ${stacked.map((s) => `${s.name} ${format(s.values[i] ?? 0)}`).join("، ")}، جمع ${format(totals[i])}` : `${cats[i]}: ${format(totals[i])}`;
  const box = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip>(null);
  const show = (e: { currentTarget: HTMLElement }, i: number) => setTip(tipAt(e.currentTarget, box.current, i, e.currentTarget.querySelector<HTMLElement>(".k-bars__bar, .k-bars__stack")));
  return (
    <figure className={cx("k-chart k-chart--bar", className)} aria-labelledby={`${id}-t`} style={{ margin: 0, ...(height ? ({ "--k-chart-height": height } as CSSProperties) : {}) }}>
      <figcaption className="k-chart__head">
        <p className="k-chart__title" id={`${id}-t`}>{title}</p>
        {stacked && stacked.length > 1 && (
          <ul className="k-chart__legend" aria-hidden="true">
            {stacked.map((s, i) => <li key={s.name} style={color(i)}><span className="k-chart__key k-chart__key--box" />{s.name}</li>)}
          </ul>
        )}
      </figcaption>
      <div className="k-chart__plot" ref={box}>
        <div className="k-bars__grid" aria-hidden="true">{ticks.map((t) => <span key={t} data-v={compact(t)} />)}</div>
        <div className="k-bars" role="list" aria-label={title}>
          {cats.map((label, i) => (
            <div
              key={label}
              className="k-bars__col"
              role="listitem"
              tabIndex={0}
              aria-label={describe(i)}
              data-active={tip?.i === i ? "" : undefined}
              style={{ "--_d": `${i * 40}ms` } as CSSProperties}
              onPointerEnter={(e) => show(e, i)}
              onPointerLeave={() => setTip(null)}
              onFocus={(e) => show(e, i)}
              onBlur={() => setTip(null)}
            >
              {labelMax && i === maxIndex && <span className="k-bars__value" aria-hidden="true">{format(totals[i])}</span>}
              {stacked ? (
                <span className="k-bars__stack" style={{ blockSize: `${(totals[i] / top) * 100}%` }} aria-hidden="true">
                  {stacked.map((s, si) => (
                    <span key={s.name} className="k-bars__seg" style={{ ...color(si), flexGrow: s.values[i] ?? 0 }} />
                  ))}
                </span>
              ) : (
                <span className="k-bars__bar" style={{ blockSize: `${(totals[i] / top) * 100}%` }} aria-hidden="true" />
              )}
              <span className="k-bars__label" aria-hidden="true">{label}</span>
            </div>
          ))}
        </div>
        {tip && (
          <ChartTip
            x={tip.x}
            y={tip.y}
            width={box.current?.clientWidth}
            title={cats[tip.i]}
            rows={stacked
              ? [...stacked.map((s, si) => ({ name: s.name, value: format(s.values[tip.i] ?? 0), color: `var(--k-chart-${si + 1})` })), { name: "جمع", value: format(totals[tip.i]) }]
              : [{ value: format(totals[tip.i]) }]}
          />
        )}
      </div>
    </figure>
  );
}

export interface BarListProps {
  title: string;
  /** به ترتیب داده‌شده؛ معمولاً از بیشترین به کمترین */
  data: { label: string; value: number; href?: string }[];
  format?: (n: number) => string;
  className?: string;
}

/** میله‌های افقی برای رتبه‌بندی با نام‌های بلند، مثل پربازدیدترین صفحه‌ها */
export function BarList({ title, data, format = fmtDefault, className }: BarListProps) {
  const id = useId();
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((n, d) => n + d.value, 0) || 1;
  const share = (v: number) => `${formatNumber(Math.round((v / total) * 1000) / 10).replace(".", "٫")}٪`;
  const box = useRef<HTMLOListElement>(null);
  const [tip, setTip] = useState<Tip>(null);
  return (
    <figure className={cx("k-chart", className)} aria-labelledby={`${id}-t`} style={{ margin: 0 }}>
      <figcaption className="k-chart__head"><p className="k-chart__title" id={`${id}-t`}>{title}</p></figcaption>
      <ol className="k-barlist" ref={box} style={{ position: "relative" }}>
        {data.map((d, i) => (
          <li
            key={d.label}
            className="k-barlist__row"
            data-active={tip?.i === i ? "" : undefined}
            style={{ "--_d": `${i * 60}ms` } as CSSProperties}
            onPointerEnter={(e) => setTip(tipAt(e.currentTarget, box.current, i, e.currentTarget.querySelector<HTMLElement>(".k-barlist__fill")))}
            onPointerLeave={() => setTip(null)}
          >
            <span className="k-barlist__track">
              <span className="k-barlist__fill" style={{ inlineSize: `${(d.value / max) * 100}%` }} aria-hidden="true" />
              {d.href ? <a className="k-barlist__label" href={d.href}>{d.label}</a> : <span className="k-barlist__label">{d.label}</span>}
            </span>
            <span className="k-barlist__value">{format(d.value)} <span className="k-barlist__share">{share(d.value)}</span></span>
          </li>
        ))}
        {tip && <ChartTip x={tip.x} y={tip.y} width={box.current?.clientWidth} title={data[tip.i].label} rows={[{ name: "مقدار", value: format(data[tip.i].value) }, { name: "سهم از کل", value: share(data[tip.i].value) }]} />}
      </ol>
    </figure>
  );
}

export interface ProportionBarProps {
  title: string;
  /** حداکثر چهار بخش؛ بیشتر را در «سایر» جمع کنید */
  data: { label: string; value: number }[];
  /** نمایش درصد کنار هر بخش در راهنما @default true */
  percent?: boolean;
  format?: (n: number) => string;
  className?: string;
}

/** سهم هر بخش از کل در یک میلهٔ افقی، مثل منبع ورود کاربران؛ جایگزین خواناتر نمودار دایره‌ای */
export function ProportionBar({ title, data, percent = true, format = fmtDefault, className }: ProportionBarProps) {
  const id = useId();
  const parts = data.slice(0, 4);
  const total = parts.reduce((n, d) => n + d.value, 0) || 1;
  const pct = (v: number) => `${formatNumber(Math.round((v / total) * 1000) / 10).replace(".", "٫")}٪`;
  const color = (i: number) => ({ "--_c": `var(--k-chart-${i + 1})` }) as CSSProperties;
  const box = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip>(null);
  return (
    <figure className={cx("k-chart", className)} aria-labelledby={`${id}-t`} style={{ margin: 0 }}>
      <figcaption className="k-chart__head"><p className="k-chart__title" id={`${id}-t`}>{title}</p></figcaption>
      <div className="k-proportion__wrap" ref={box}>
        <div className="k-proportion" aria-hidden="true">
          {parts.map((d, i) => (
            <span
              key={d.label}
              className="k-proportion__seg"
              data-active={tip?.i === i ? "" : undefined}
              style={{ ...color(i), flexGrow: d.value }}
              onPointerEnter={(e) => setTip(tipAt(e.currentTarget, box.current, i))}
              onPointerLeave={() => setTip(null)}
            />
          ))}
        </div>
        {tip && <ChartTip x={tip.x} y={tip.y} width={box.current?.clientWidth} rows={[{ name: parts[tip.i].label, value: pct(parts[tip.i].value), color: `var(--k-chart-${tip.i + 1})` }, { name: "تعداد", value: format(parts[tip.i].value) }]} />}
      </div>
      <ul className="k-proportion__legend">
        {parts.map((d, i) => (
          <li key={d.label} style={color(i)} data-active={tip?.i === i ? "" : undefined}>
            <span className="k-chart__key k-chart__key--box" aria-hidden="true" />
            <span>{d.label}</span>
            <strong>{percent ? pct(d.value) : format(d.value)}</strong>
            {percent && <span className="k-proportion__abs">{format(d.value)}</span>}
          </li>
        ))}
      </ul>
    </figure>
  );
}

export interface PieChartProps {
  title: string;
  /** بیش از پنج بخش در «سایر» جمع می‌شود */
  data: { label: string; value: number }[];
  /** «donut» با جمع کل در وسط @default "donut" */
  variant?: "donut" | "pie";
  format?: (n: number) => string;
  /** برچسب وسط دونات @default «جمع» */
  totalLabel?: string;
  /** اندازهٔ نمودار به پیکسل @default 176 */
  size?: number;
  className?: string;
}

/**
 * نمودار دایره‌ای یا دونات تا پنج بخش، با فاصلهٔ کوچک بین بخش‌ها، راهنمای درصد و جدول هم‌ارز.
 * برای مقایسهٔ دقیق بخش‌ها ProportionBar خواناتر است.
 */
export function PieChart({ title, data, variant = "donut", format = fmtDefault, totalLabel = "جمع", size = 176, className }: PieChartProps) {
  const id = useId();
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const parts = sorted.length > 5 ? [...sorted.slice(0, 4), { label: "سایر", value: sorted.slice(4).reduce((n, d) => n + d.value, 0) }] : sorted;
  const total = parts.reduce((n, d) => n + d.value, 0) || 1;
  const pct = (v: number) => `${formatNumber(Math.round((v / total) * 1000) / 10).replace(".", "٫")}٪`;
  const slot = (i: number) => (i < 4 ? `var(--k-chart-${i + 1})` : "var(--k-text-quaternary)");
  const donut = variant === "donut";
  // دایره با stroke-dasharray: هر بخش یک کمان؛ برای pie، شعاع نصف و ضخامت برابر قطر
  const R = 50, r = donut ? 40 : 25, w = donut ? 16 : 50;
  const C = 2 * Math.PI * r;
  const gap = parts.length > 1 ? (donut ? 1.6 : 0.8) : 0;
  const [active, setActive] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  let acc = 0;
  const arcs = parts.map((d) => {
    const len = (d.value / total) * C;
    const a = { start: acc, len };
    acc += len;
    return a;
  });
  const mid = (i: number) => {
    const ang = ((arcs[i].start + arcs[i].len / 2) / C) * 2 * Math.PI - Math.PI / 2;
    const rr = donut ? r : r * 1.3;
    return { x: (R + rr * Math.cos(ang)) / (2 * R), y: (R + rr * Math.sin(ang)) / (2 * R) };
  };
  return (
    <figure className={cx("k-chart k-pie", className)} aria-labelledby={`${id}-t`} style={{ margin: 0 }}>
      <figcaption className="k-chart__head"><p className="k-chart__title" id={`${id}-t`}>{title}</p></figcaption>
      <div className="k-pie__body">
        <div className="k-pie__plot" ref={box} style={{ inlineSize: size, blockSize: size }} onPointerLeave={() => setActive(null)}>
          <svg viewBox="0 0 100 100" className="k-pie__svg" aria-hidden="true">
            {donut && <circle cx={R} cy={R} r={r} fill="none" stroke="var(--k-bg-tertiary)" strokeWidth={w} />}
            {parts.map((d, i) => (
              <circle
                key={d.label}
                className="k-pie__slice"
                data-active={active === i ? "" : undefined}
                cx={R}
                cy={R}
                r={r}
                fill="none"
                stroke={slot(i)}
                strokeWidth={w}
                strokeDasharray={`${Math.max(0, arcs[i].len - gap)} ${C}`}
                strokeDashoffset={-arcs[i].start}
                transform={`rotate(-90 ${R} ${R})`}
                style={{ "--_d": `${i * 80}ms` } as CSSProperties}
                onPointerEnter={() => setActive(i)}
              />
            ))}
          </svg>
          {donut && (
            <div className="k-pie__center" aria-hidden="true">
              <strong>{active === null ? format(total) : pct(parts[active].value)}</strong>
              <span>{active === null ? totalLabel : parts[active].label}</span>
            </div>
          )}
          {active !== null && !donut && (
            <ChartTip x={mid(active).x * size} y={mid(active).y * size - 8} rows={[{ name: parts[active].label, value: pct(parts[active].value), color: slot(active) }, { name: "تعداد", value: format(parts[active].value) }]} />
          )}
        </div>
        <ul className="k-pie__legend">
          {parts.map((d, i) => (
            <li key={d.label} style={{ "--_c": slot(i) } as CSSProperties} data-active={active === i ? "" : undefined} onPointerEnter={() => setActive(i)} onPointerLeave={() => setActive(null)}>
              <span className="k-chart__key k-chart__key--box" aria-hidden="true" />
              <span className="k-pie__name">{d.label}</span>
              <strong>{pct(d.value)}</strong>
              <span className="k-pie__abs">{format(d.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}

export interface SparklineProps {
  values: number[];
  /** نام دسترس‌پذیر، مثل «روند فروش هفت روز اخیر: افزایشی» */
  "aria-label"?: string;
  /** رنگ خط @default برند */
  tone?: "brand" | "success" | "error" | "neutral";
  /** سطح کم‌رنگ زیر خط @default true */
  area?: boolean;
  className?: string;
}

/** خط روند کوچک برای کارت آمار و جدول؛ بدون محور، فقط شکل روند */
export function Sparkline({ values, "aria-label": ariaLabel, tone = "brand", area = true, className }: SparklineProps) {
  const hi = Math.max(...values), lo = Math.min(...values);
  // حداقل دامنه ۲۵٪ مقدار تا تغییر کوچک، زیگزاگ بزرگ دیده نشود
  const span = Math.max(hi - lo, Math.abs(hi) * 0.25) || 1;
  const min = (hi + lo) / 2 - span / 2;
  const pts = values.map((v, i) => [(i / Math.max(1, values.length - 1)) * 100, 28 - ((v - min) / span) * 24] as const);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  const c = tone === "neutral" ? "var(--k-text-tertiary)" : tone === "brand" ? "var(--k-text-brand)" : `var(--k-text-${tone})`;
  return (
    <svg className={cx("k-sparkline", className)} viewBox="0 0 100 30" preserveAspectRatio="none" role={ariaLabel ? "img" : undefined} aria-label={ariaLabel} aria-hidden={ariaLabel ? undefined : true} style={{ color: c }}>
      {area && <path d={`${d} L100,30 L0,30 Z`} fill="currentColor" opacity={0.1} />}
      <path d={d} fill="none" stroke="currentColor" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export interface LineSeries {
  name: string;
  values: number[];
}

export interface LineChartProps {
  title: string;
  /** برچسب محور افقی، مثل ماه‌ها */
  labels: string[];
  /** حداکثر چهار سری؛ رنگ‌ها به ترتیب ثابت */
  series: LineSeries[];
  format?: (n: number) => string;
  /** سطح کم‌رنگ زیر خط (فقط برای یک سری) */
  area?: boolean;
  height?: string;
  className?: string;
}

/**
 * نمودار خطی تا چهار سری: خط ۲ پیکسلی، برچسب نام در انتهای هر خط،
 * راهنمای عمودی با موس و ←→ روی کیبورد، و جدول هم‌ارز برای صفحه‌خوان.
 */
export function LineChart({ title, labels, series, format = fmtDefault, area, height, className }: LineChartProps) {
  const id = useId();
  const plot = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 600, h: 220, rtl: true });
  const [active, setActive] = useState<number | null>(null);
  const shown = series.slice(0, 4);

  useLayoutEffect(() => {
    const el = plot.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight, rtl: getComputedStyle(el).direction === "rtl" });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pad = { top: 12, bottom: 24, start: 52, end: shown.length > 1 ? 64 : 16 };
  const max = Math.max(0, ...shown.flatMap((s) => s.values));
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1] || 1;
  const innerW = Math.max(1, size.w - pad.start - pad.end);
  const innerH = Math.max(1, size.h - pad.top - pad.bottom);
  // محور زمان در جهت خواندن صفحه: در RTL اولین نقطه سمت راست
  const x = (i: number) => {
    const t = labels.length > 1 ? i / (labels.length - 1) : 0.5;
    return size.rtl ? size.w - pad.start - t * innerW : pad.start + t * innerW;
  };
  const y = (v: number) => pad.top + innerH - (v / top) * innerH;
  // SVG با جهت ltr رسم می‌شود تا text-anchor فیزیکی باشد؛ اعداد محور بیرون از ناحیهٔ نمودار
  const tickX = size.rtl ? size.w - pad.start + 8 : pad.start - 8;
  const anchor = size.rtl ? "start" : "end";
  // برچسب انتهای خط‌ها روی هم نیفتند: دست‌کم ۱۴ پیکسل فاصلهٔ عمودی
  const last = labels.length - 1;
  const endY = (() => {
    const order = shown.map((s, i) => ({ i, y: y(s.values[last]) })).sort((a, b) => a.y - b.y);
    for (let k = 1; k < order.length; k++) if (order[k].y - order[k - 1].y < 14) order[k].y = order[k - 1].y + 14;
    return Object.fromEntries(order.map((o) => [o.i, o.y]));
  })();
  const endX = (i: number) => x(i) + (size.rtl ? -8 : 8);
  const color = (i: number) => ({ "--_c": `var(--k-chart-${i + 1})` }) as CSSProperties;

  const pick = (clientX: number) => {
    const r = plot.current!.getBoundingClientRect();
    const px = clientX - r.left;
    let best = 0;
    labels.forEach((_, i) => { if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i; });
    setActive(best);
  };
  const onKey = (e: KeyboardEvent) => {
    const next = { ArrowLeft: size.rtl ? 1 : -1, ArrowRight: size.rtl ? -1 : 1 }[e.key];
    if (next) {
      e.preventDefault();
      setActive((a) => Math.min(labels.length - 1, Math.max(0, (a ?? (next > 0 ? -1 : labels.length)) + next)));
    } else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(labels.length - 1);
    else if (e.key === "Escape") setActive(null);
  };

  const step = Math.max(1, Math.ceil(labels.length / Math.max(2, Math.floor(innerW / 64))));
  return (
    <figure className={cx("k-chart", className)} aria-labelledby={`${id}-t`} style={{ margin: 0, ...(height ? ({ "--k-chart-height": height } as CSSProperties) : {}) }}>
      <figcaption className="k-chart__head">
        <p className="k-chart__title" id={`${id}-t`}>{title}</p>
        {shown.length > 1 && (
          <ul className="k-chart__legend" aria-hidden="true">
            {shown.map((s, i) => <li key={s.name} style={color(i)}><span className="k-chart__key" />{s.name}</li>)}
          </ul>
        )}
      </figcaption>
      <div
        ref={plot}
        className="k-chart__plot"
        tabIndex={0}
        role="img"
        aria-label={`${title}. با کلیدهای جهت بین نقطه‌ها حرکت کنید.`}
        aria-describedby={`${id}-live`}
        onPointerMove={(e) => pick(e.clientX)}
        onPointerLeave={() => setActive(null)}
        onKeyDown={onKey}
        onBlur={() => setActive(null)}
      >
        <svg className="k-chart__svg" aria-hidden="true" direction="ltr">
          <g className="k-chart__grid">
            {ticks.map((t) => <line key={t} x1={pad.start - (size.rtl ? 0 : 0)} x2={size.w - pad.end} y1={y(t)} y2={y(t)} transform={size.rtl ? `translate(${pad.end - pad.start} 0)` : undefined} />)}
          </g>
          {ticks.map((t) => <text key={t} className="k-chart__tick" x={tickX} y={y(t) + 4} textAnchor={anchor}>{compact(t)}</text>)}
          {labels.map((l, i) => (i % step === 0 || i === labels.length - 1) && <text key={l} className="k-chart__tick" x={x(i)} y={size.h - 6} textAnchor="middle">{l}</text>)}
          <defs>
            <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: "var(--k-chart-1)", stopOpacity: 0.28 }} />
              <stop offset="1" style={{ stopColor: "var(--k-chart-1)", stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          {(area ?? shown.length === 1) && shown.length === 1 && (
            <path className="k-chart__area" fill={`url(#${id}-fade)`} d={`M${x(0)},${y(0)} ${shown[0].values.map((v, i) => `L${x(i)},${y(v)}`).join(" ")} L${x(labels.length - 1)},${y(0)} Z`} />
          )}
          {active !== null && <line className="k-chart__cross" x1={x(active)} x2={x(active)} y1={pad.top} y2={pad.top + innerH} />}
          {shown.map((s, si) => (
            <g key={s.name} style={color(si)}>
              <path className="k-chart__line" pathLength={1} d={s.values.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ")} />
              <circle className="k-chart__dot" cx={x(s.values.length - 1)} cy={y(s.values[s.values.length - 1])} r={4} />
              {shown.length > 1 && <text className="k-chart__end" x={endX(last)} y={endY[si] + 4} textAnchor={size.rtl ? "end" : "start"}>{s.name}</text>}
              {active !== null && <circle className="k-chart__dot" cx={x(active)} cy={y(s.values[active])} r={4.5} />}
            </g>
          ))}
        </svg>
        {active !== null && (
          <ChartTip
            x={x(active)}
            y={Math.min(...shown.map((s) => y(s.values[active]))) - 6}
            width={size.w}
            title={labels[active]}
            rows={shown.map((s, si) => ({ name: s.name, value: format(s.values[active]), color: `var(--k-chart-${si + 1})` }))}
          />
        )}
      </div>
      <span className="k-sr-only" aria-live="polite" id={`${id}-live`}>
        {active !== null ? `${labels[active]}: ${shown.map((s) => `${s.name} ${format(s.values[active])}`).join("، ")}` : ""}
      </span>
      <DataTable caption={title} labels={labels} series={shown} format={format} />
    </figure>
  );
}
