import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { PROVINCES, formatNumber } from "@kashi-ui/persian";
import { cx } from "./cx.js";
import { ChartTip } from "./Chart.js";
import { IRAN_PROVINCES, IRAN_VIEWBOX } from "./iranMapData.js";

type Selection = string | string[] | null;

interface IranMapBase {
  /** داده برای نقشهٔ رنگی: نام استان ← عدد؛ استان‌های بدون داده خاکستری می‌مانند */
  data?: Record<string, number>;
  /** نام دسترس‌پذیر @default «نقشهٔ استان‌های ایران» */
  label?: string;
  /** واحد در راهنما و جدول، مثل «سفارش» */
  unit?: string;
  /** قالب عدد @default ارقام فارسی با جداکنندهٔ هزارگان */
  format?: (n: number) => string;
  /** تعداد پله‌های رنگ @default 5 */
  steps?: number;
  /**
   * تقسیم داده بین پله‌ها: "quantile" هر پله تقریباً تعداد برابری استان می‌گیرد (وقتی یک استان مثل تهران خیلی بزرگ‌تر است،
   * بقیه هم از هم جدا دیده می‌شوند)؛ "linear" بازهٔ کمینه تا بیشینه را مساوی تقسیم می‌کند @default "quantile"
   */
  scale?: "quantile" | "linear";
  /** راهنمای رنگ زیر نقشه @default true وقتی data دارد */
  legend?: boolean;
  /** خط اضافه در راهنمای هر استان، مثل «۱۲٪ رشد» */
  tooltip?: (province: string, value: number | undefined) => string;
  className?: string;
}

/** انتخاب یک استان؛ با دادن value، defaultValue یا onChange نقشه قابل انتخاب می‌شود */
interface IranMapSingle extends IranMapBase {
  multiple?: false;
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
}

/** انتخاب چند استان */
interface IranMapMultiple extends IranMapBase {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
}

export type IranMapProps = IranMapSingle | IranMapMultiple;

const NAMES = PROVINCES.map((p) => p.name);
const CAPITAL = Object.fromEntries(PROVINCES.map((p) => [p.name, p.capital]));
const [, , VW, VH] = IRAN_VIEWBOX.split(" ").map(Number);

/** نقشهٔ ۳۱ استان ایران؛ نقشهٔ رنگی برای داده و/یا انتخاب یک یا چند استان، با صفحه‌کلید و جدول هم‌ارز */
export function IranMap(props: IranMapProps) {
  const {
    data, value, defaultValue, multiple = false, label = "نقشهٔ استان‌های ایران", unit,
    format = (n: number) => formatNumber(n), steps = 5, scale = "quantile", legend, tooltip, className,
  } = props;
  const onChange = props.onChange as ((v: Selection) => void) | undefined;
  const selectable = value !== undefined || defaultValue !== undefined || onChange !== undefined;
  const [inner, setInner] = useState<Selection>(defaultValue ?? (multiple ? [] : null));
  const selected = value !== undefined ? value : inner;
  const isSelected = (n: string) => (Array.isArray(selected) ? selected.includes(n) : selected === n);
  const [active, setActive] = useState(0);
  const [inside, setInside] = useState(false);
  // ورود با Tab روی استان انتخاب‌شده؛ داخل نقشه همان استانی که جهت‌نماها رویش رفته‌اند
  const firstSelected = NAMES.findIndex((n) => isSelected(n));
  const tabStop = inside || firstSelected < 0 ? active : firstSelected;
  const [tip, setTip] = useState<string | null>(null);
  const box = useRef<HTMLElement>(null);
  const refs = useRef<(SVGPathElement | null)[]>([]);

  const values = data ? NAMES.map((n) => data[n]).filter((v): v is number => typeof v === "number") : [];
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;
  const sorted = [...values].sort((a, b) => a - b);
  const level = (n: string) => {
    const v = data?.[n];
    if (typeof v !== "number") return undefined;
    if (max === min) return steps;
    // رتبهٔ اولین مقدار برابر، تا استان‌های هم‌مقدار یک رنگ بگیرند
    // کمترین همیشه پلهٔ اول و بیشترین همیشه پلهٔ آخر؛ بقیه بر اساس رتبه بینشان پخش می‌شوند
    if (scale === "quantile") return 1 + Math.round((sorted.indexOf(v) * (steps - 1)) / (sorted.length - 1));
    return Math.min(steps, 1 + Math.floor(((v - min) / (max - min)) * steps));
  };

  // شدت رنگ هر پله؛ کم‌رنگ‌ترین پله هم از خاکستری «بدون داده» جدا دیده شود
  const shade = (l: number) => `${Math.round(12 + (88 * l) / steps)}%`;

  const toggle = (n: string) => {
    let next: Selection;
    if (multiple) {
      const list = Array.isArray(selected) ? selected : [];
      next = list.includes(n) ? list.filter((x) => x !== n) : [...list, n];
    } else next = selected === n ? null : n;
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  const describe = (n: string) => {
    const v = data?.[n];
    return typeof v === "number" ? `${n}: ${format(v)}${unit ? ` ${unit}` : ""}` : n;
  };

  // فوکوس گردشی: یک استان در ترتیب Tab است و جهت‌نماها بین استان‌ها جابه‌جا می‌شوند
  const onKey = (e: KeyboardEvent, i: number) => {
    const move = { ArrowLeft: 1, ArrowDown: 1, ArrowRight: -1, ArrowUp: -1 }[e.key];
    let next = i;
    if (move) next = (i + move + NAMES.length) % NAMES.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = NAMES.length - 1;
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(NAMES[i]); return; }
    else return;
    e.preventDefault();
    setActive(next);
    setTip(NAMES[next]);
    refs.current[next]?.focus();
  };

  const tipProvince = tip ? IRAN_PROVINCES[tip] : null;
  const tipValue = tip ? data?.[tip] : undefined;
  const showLegend = legend ?? Boolean(data);
  const ratio = (VH / VW) * 100;

  return (
    <figure ref={box} className={cx("k-iran-map", selectable && "k-iran-map--selectable", className)} onPointerLeave={() => setTip(null)}>
      <div className="k-iran-map__canvas" style={{ paddingBlockEnd: `${ratio}%` }}>
        <svg
          viewBox={IRAN_VIEWBOX}
          className="k-iran-map__svg"
          role={selectable ? (multiple ? "group" : "radiogroup") : "img"}
          onFocus={() => setInside(true)}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setInside(false); }}
          aria-label={selectable ? label : `${label}${data ? `؛ جدول داده در ادامه` : ""}`}
        >
          {NAMES.map((n, i) => {
            const p = IRAN_PROVINCES[n];
            const on = isSelected(n);
            return (
              <path
                key={n}
                ref={(el) => { refs.current[i] = el; }}
                d={p.d}
                className="k-iran-map__province"
                data-l={level(n)}
                style={level(n) ? ({ "--_p": shade(level(n)!) } as CSSProperties) : undefined}
                data-selected={on ? "" : undefined}
                data-active={tip === n ? "" : undefined}
                role={selectable ? (multiple ? "checkbox" : "radio") : undefined}
                aria-checked={selectable ? on : undefined}
                aria-label={selectable ? describe(n) : undefined}
                tabIndex={selectable ? (i === tabStop ? 0 : -1) : undefined}
                onPointerEnter={() => setTip(n)}
                onFocus={() => { setActive(i); setTip(n); }}
                onBlur={() => setTip(null)}
                onClick={selectable ? () => { setActive(i); toggle(n); } : undefined}
                onKeyDown={selectable ? (e) => onKey(e, i) : undefined}
              />
            );
          })}
        </svg>
        {tipProvince && (
          <ChartTip
            x={(tipProvince.x / VW) * (box.current?.clientWidth ?? VW)}
            y={(tipProvince.y / VH) * ((box.current?.clientWidth ?? VW) * (VH / VW)) - 6}
            width={box.current?.clientWidth}
            title={tip}
            rows={[
              ...(typeof tipValue === "number" ? [{ value: `${format(tipValue)}${unit ? ` ${unit}` : ""}` }] : []),
              ...(tooltip ? [{ value: tooltip(tip!, tipValue) }] : []),
              ...(typeof tipValue !== "number" && !tooltip ? [{ value: `مرکز: ${CAPITAL[tip!]}` }] : []),
            ]}
          />
        )}
      </div>

      {showLegend && values.length > 0 && (
        <figcaption className="k-iran-map__legend">
          <span>{format(min)}</span>
          <span className="k-iran-map__scale" aria-hidden="true">
            {Array.from({ length: steps }, (_, i) => <i key={i} style={{ "--_p": shade(i + 1) } as CSSProperties} />)}
          </span>
          <span>{format(max)}{unit ? ` ${unit}` : ""}</span>
        </figcaption>
      )}

      {data && (
        <table className="k-sr-only">
          <caption>{label}</caption>
          <tbody>
            {NAMES.filter((n) => typeof data[n] === "number").sort((a, b) => data[b]! - data[a]!).map((n) => (
              <tr key={n}><th scope="row">{n}</th><td>{format(data[n]!)}{unit ? ` ${unit}` : ""}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </figure>
  );
}
