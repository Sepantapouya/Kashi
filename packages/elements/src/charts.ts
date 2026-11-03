import { JALALI_MONTHS, formatJalali, formatNumber, jalaliMonthLength, toGregorian, toISODate, toJalali } from "@kashi-ui/persian";
import { HTMLBase, define, esc, uid } from "./base.js";

// نمودارها: عنوان با label، داده با ویژگی JSON (data، labels، series) یا با JavaScript (element.data = …)،
// قالب عدد با element.format = (n) => "…" یا ویژگی unit. هر نمودار جدول هم‌ارز برای صفحه‌خوان دارد.

type Series = { name: string; values: number[] };
type Point = { label: string; value: number; href?: string };
type Row = { name?: string; value: string; color?: string };

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
const pctOf = (v: number, total: number) => `${formatNumber(Math.round((v / (total || 1)) * 1000) / 10).replace(".", "٫")}٪`;
const chartColor = (i: number) => `var(--k-chart-${i + 1})`;

const json = <T,>(t: string | null, fallback: T): T => {
  if (!t) return fallback;
  try {
    return JSON.parse(t) as T;
  } catch {
    return fallback;
  }
};

/** پایهٔ نمودارها: داده از ویژگی‌های JSON یا JavaScript، با هر تغییر دوباره رسم می‌شود */
abstract class Chart extends HTMLBase {
  protected key = uid("kashi-chart");
  private fmt?: (n: number) => string;
  protected props: Record<string, unknown> = {};
  protected abstract draw(): void;

  connectedCallback() {
    this.draw();
  }
  attributeChangedCallback() {
    if (this.isConnected) this.draw();
  }
  /** قالب عدد در راهنما و برچسب‌ها */
  get format(): (n: number) => string {
    const unit = this.getAttribute("unit");
    return this.fmt ?? ((n) => `${formatNumber(Math.round(n))}${unit ? ` ${unit}` : ""}`);
  }
  set format(f: (n: number) => string) {
    this.fmt = f;
    if (this.isConnected) this.draw();
  }
  /** مقدار داده‌شده با JavaScript، وگرنه ویژگی JSON */
  protected read<T>(name: string, fallback: T): T {
    return (this.props[name] as T | undefined) ?? json(this.getAttribute(name), fallback);
  }
  protected write(name: string, v: unknown) {
    this.props[name] = v;
    if (this.isConnected) this.draw();
  }
  /** عنوان نمودار با ویژگی label (نه title، که راهنمای پیش‌فرض مرورگر را روی کل نمودار نشان می‌دهد) */
  protected get heading() {
    return this.getAttribute("label") ?? "";
  }

  /** راهنمای شناور داخل box در نقطهٔ (x, y)؛ داخل ظرف می‌ماند */
  protected tip(box: HTMLElement, x: number | null, y = 0, title?: string, rows: Row[] = []) {
    let t = box.querySelector<HTMLElement>(":scope > .k-chart__tip");
    if (x === null) {
      t?.remove();
      return;
    }
    if (!t) {
      t = document.createElement("div");
      t.className = "k-chart__tip";
      t.setAttribute("aria-hidden", "true");
      box.append(t);
    }
    const w = box.clientWidth;
    t.style.left = `${w ? Math.min(Math.max(x, 80), w - 80) : x}px`;
    t.style.top = `${y}px`;
    t.innerHTML = `${title ? `<span class="k-chart__tip-title">${esc(title)}</span>` : ""}${rows.map((r) => `<span class="k-chart__tip-row"${r.color ? ` style="--_c: ${r.color}"` : ""}>${r.name !== undefined ? `<span>${r.color ? "<i></i>" : ""}${esc(r.name)}</span>` : ""}<strong>${esc(r.value)}</strong></span>`).join("")}`;
  }
  /** موقعیت بالای یک عنصر نسبت به ظرف */
  protected at(el: Element, box: Element) {
    const b = box.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2 - b.left, y: r.top - b.top };
  }
}

/** نمودار ستونی: data='[{"label":"…","value":…}]'، یا انباشته با labels و series (تا چهار سری) */
export class KashiBarChart extends Chart {
  static observedAttributes = ["label", "data", "labels", "series", "unit", "label-max", "height"];
  get data() { return this.read<Point[]>("data", []); }
  set data(v: Point[]) { this.write("data", v); }
  get series() { return this.read<Series[]>("series", []); }
  set series(v: Series[]) { this.write("series", v); }
  get labels() { return this.read<string[]>("labels", []); }
  set labels(v: string[]) { this.write("labels", v); }

  protected draw() {
    const f = this.format;
    const stacked = this.series.length ? this.series.slice(0, 4) : null;
    const data = this.data;
    const cats = stacked ? this.labels : data.map((d) => d.label);
    const totals = cats.map((_, i) => (stacked ? stacked.reduce((n, s) => n + (s.values[i] ?? 0), 0) : data[i].value));
    const max = Math.max(0, ...totals);
    const ticks = niceTicks(max);
    const top = ticks.at(-1) || 1;
    const maxI = totals.indexOf(max);
    const labelMax = this.getAttribute("label-max") !== "false";
    const describe = (i: number) => (stacked ? `${cats[i]}: ${stacked.map((s) => `${s.name} ${f(s.values[i] ?? 0)}`).join("، ")}، جمع ${f(totals[i])}` : `${cats[i]}: ${f(totals[i])}`);
    const height = this.getAttribute("height");
    this.innerHTML = `<figure class="k-chart k-chart--bar" aria-labelledby="${this.key}-t" style="margin: 0${height ? `; --k-chart-height: ${esc(height)}` : ""}"><figcaption class="k-chart__head"><p class="k-chart__title" id="${this.key}-t">${esc(this.heading)}</p>${stacked && stacked.length > 1 ? `<ul class="k-chart__legend" aria-hidden="true">${stacked.map((s, i) => `<li style="--_c: ${chartColor(i)}"><span class="k-chart__key k-chart__key--box"></span>${esc(s.name)}</li>`).join("")}</ul>` : ""}</figcaption><div class="k-chart__plot"><div class="k-bars__grid" aria-hidden="true">${ticks.map((t) => `<span data-v="${esc(compact(t))}"></span>`).join("")}</div><div class="k-bars" role="list" aria-label="${esc(this.heading)}">${cats.map((label, i) => `<div class="k-bars__col" role="listitem" tabindex="0" data-i="${i}" aria-label="${esc(describe(i))}" style="--_d: ${i * 40}ms">${labelMax && i === maxI ? `<span class="k-bars__value" aria-hidden="true">${esc(f(totals[i]))}</span>` : ""}${stacked ? `<span class="k-bars__stack" style="block-size: ${(totals[i] / top) * 100}%" aria-hidden="true">${stacked.map((s, si) => `<span class="k-bars__seg" style="--_c: ${chartColor(si)}; flex-grow: ${s.values[i] ?? 0}"></span>`).join("")}</span>` : `<span class="k-bars__bar" style="block-size: ${(totals[i] / top) * 100}%" aria-hidden="true"></span>`}<span class="k-bars__label" aria-hidden="true">${esc(label)}</span></div>`).join("")}</div></div></figure>`;
    const plot = this.querySelector<HTMLElement>(".k-chart__plot")!;
    const show = (col: HTMLElement) => {
      const i = Number(col.dataset.i);
      plot.querySelector("[data-active]")?.removeAttribute("data-active");
      col.setAttribute("data-active", "");
      const p = this.at(col.querySelector(".k-bars__bar, .k-bars__stack") ?? col, plot);
      this.tip(plot, p.x, p.y, cats[i], stacked
        ? [...stacked.map((s, si) => ({ name: s.name, value: f(s.values[i] ?? 0), color: chartColor(si) })), { name: "جمع", value: f(totals[i]) }]
        : [{ value: f(totals[i]) }]);
    };
    const hide = () => {
      plot.querySelector("[data-active]")?.removeAttribute("data-active");
      this.tip(plot, null);
    };
    plot.querySelectorAll<HTMLElement>(".k-bars__col").forEach((col) => {
      col.addEventListener("pointerenter", () => show(col));
      col.addEventListener("focus", () => show(col));
      col.addEventListener("pointerleave", hide);
      col.addEventListener("blur", hide);
    });
  }
}

/** میله‌های افقی برای رتبه‌بندی: data='[{"label":"…","value":…,"href":"…"}]' */
export class KashiBarList extends Chart {
  static observedAttributes = ["label", "data", "unit"];
  get data() { return this.read<Point[]>("data", []); }
  set data(v: Point[]) { this.write("data", v); }

  protected draw() {
    const f = this.format;
    const data = this.data;
    const max = Math.max(1, ...data.map((d) => d.value));
    const total = data.reduce((n, d) => n + d.value, 0);
    this.innerHTML = `<figure class="k-chart" aria-labelledby="${this.key}-t" style="margin: 0"><figcaption class="k-chart__head"><p class="k-chart__title" id="${this.key}-t">${esc(this.heading)}</p></figcaption><ol class="k-barlist" style="position: relative">${data.map((d, i) => `<li class="k-barlist__row" data-i="${i}" style="--_d: ${i * 60}ms"><span class="k-barlist__track"><span class="k-barlist__fill" style="inline-size: ${(d.value / max) * 100}%" aria-hidden="true"></span>${d.href ? `<a class="k-barlist__label" href="${esc(d.href)}">${esc(d.label)}</a>` : `<span class="k-barlist__label">${esc(d.label)}</span>`}</span><span class="k-barlist__value">${esc(f(d.value))} <span class="k-barlist__share">${pctOf(d.value, total)}</span></span></li>`).join("")}</ol></figure>`;
    const box = this.querySelector<HTMLElement>(".k-barlist")!;
    box.querySelectorAll<HTMLElement>(".k-barlist__row").forEach((row) => {
      row.addEventListener("pointerenter", () => {
        const d = data[Number(row.dataset.i)];
        row.setAttribute("data-active", "");
        const p = this.at(row.querySelector(".k-barlist__fill")!, box);
        this.tip(box, p.x, p.y, d.label, [{ name: "مقدار", value: f(d.value) }, { name: "سهم از کل", value: pctOf(d.value, total) }]);
      });
      row.addEventListener("pointerleave", () => {
        row.removeAttribute("data-active");
        this.tip(box, null);
      });
    });
  }
}

/** سهم هر بخش از کل در یک میلهٔ افقی (تا چهار بخش): data='[{"label":"…","value":…}]' */
export class KashiProportionBar extends Chart {
  static observedAttributes = ["label", "data", "unit", "percent"];
  get data() { return this.read<Point[]>("data", []); }
  set data(v: Point[]) { this.write("data", v); }

  protected draw() {
    const f = this.format;
    const parts = this.data.slice(0, 4);
    const total = parts.reduce((n, d) => n + d.value, 0);
    const percent = this.getAttribute("percent") !== "false";
    this.innerHTML = `<figure class="k-chart" aria-labelledby="${this.key}-t" style="margin: 0"><figcaption class="k-chart__head"><p class="k-chart__title" id="${this.key}-t">${esc(this.heading)}</p></figcaption><div class="k-proportion__wrap"><div class="k-proportion" aria-hidden="true">${parts.map((d, i) => `<span class="k-proportion__seg" data-i="${i}" style="--_c: ${chartColor(i)}; flex-grow: ${d.value}"></span>`).join("")}</div></div><ul class="k-proportion__legend">${parts.map((d, i) => `<li data-i="${i}" style="--_c: ${chartColor(i)}"><span class="k-chart__key k-chart__key--box" aria-hidden="true"></span><span>${esc(d.label)}</span><strong>${esc(percent ? pctOf(d.value, total) : f(d.value))}</strong>${percent ? `<span class="k-proportion__abs">${esc(f(d.value))}</span>` : ""}</li>`).join("")}</ul></figure>`;
    const box = this.querySelector<HTMLElement>(".k-proportion__wrap")!;
    const mark = (i: number | null) => this.querySelectorAll<HTMLElement>("[data-i]").forEach((el) => el.toggleAttribute("data-active", Number(el.dataset.i) === i));
    box.querySelectorAll<HTMLElement>(".k-proportion__seg").forEach((seg) => {
      seg.addEventListener("pointerenter", () => {
        const i = Number(seg.dataset.i);
        mark(i);
        const p = this.at(seg, box);
        this.tip(box, p.x, p.y, undefined, [{ name: parts[i].label, value: pctOf(parts[i].value, total), color: chartColor(i) }, { name: "تعداد", value: f(parts[i].value) }]);
      });
      seg.addEventListener("pointerleave", () => {
        mark(null);
        this.tip(box, null);
      });
    });
  }
}

/** نمودار دایره‌ای یا دونات تا پنج بخش (بقیه در «سایر»): data='[{"label":"…","value":…}]'، variant="pie" */
export class KashiPieChart extends Chart {
  static observedAttributes = ["label", "data", "unit", "variant", "total-label", "size"];
  get data() { return this.read<Point[]>("data", []); }
  set data(v: Point[]) { this.write("data", v); }

  protected draw() {
    const f = this.format;
    const sorted = [...this.data].sort((a, b) => b.value - a.value);
    const parts = sorted.length > 5 ? [...sorted.slice(0, 4), { label: "سایر", value: sorted.slice(4).reduce((n, d) => n + d.value, 0) }] : sorted;
    const total = parts.reduce((n, d) => n + d.value, 0) || 1;
    const slot = (i: number) => (i < 4 ? chartColor(i) : "var(--k-text-quaternary)");
    const donut = this.getAttribute("variant") !== "pie";
    const size = Number(this.getAttribute("size")) || 176;
    const totalLabel = this.getAttribute("total-label") ?? "جمع";
    // هر بخش یک کمان با stroke-dasharray؛ برای pie، شعاع نصف و ضخامت برابر قطر
    const R = 50, r = donut ? 40 : 25, w = donut ? 16 : 50;
    const C = 2 * Math.PI * r;
    const gap = parts.length > 1 ? (donut ? 1.6 : 0.8) : 0;
    let acc = 0;
    const arcs = parts.map((d) => {
      const len = (d.value / total) * C;
      const a = { start: acc, len };
      acc += len;
      return a;
    });
    this.innerHTML = `<figure class="k-chart k-pie" aria-labelledby="${this.key}-t" style="margin: 0"><figcaption class="k-chart__head"><p class="k-chart__title" id="${this.key}-t">${esc(this.heading)}</p></figcaption><div class="k-pie__body"><div class="k-pie__plot" style="inline-size: ${size}px; block-size: ${size}px"><svg viewBox="0 0 100 100" class="k-pie__svg" aria-hidden="true">${donut ? `<circle cx="${R}" cy="${R}" r="${r}" fill="none" stroke="var(--k-bg-tertiary)" stroke-width="${w}"></circle>` : ""}${parts.map((d, i) => `<circle class="k-pie__slice" data-i="${i}" cx="${R}" cy="${R}" r="${r}" fill="none" stroke="${slot(i)}" stroke-width="${w}" stroke-dasharray="${Math.max(0, arcs[i].len - gap)} ${C}" stroke-dashoffset="${-arcs[i].start}" transform="rotate(-90 ${R} ${R})" style="--_d: ${i * 80}ms"></circle>`).join("")}</svg>${donut ? `<div class="k-pie__center" aria-hidden="true"><strong>${esc(f(total))}</strong><span>${esc(totalLabel)}</span></div>` : ""}</div><ul class="k-pie__legend">${parts.map((d, i) => `<li data-i="${i}" style="--_c: ${slot(i)}"><span class="k-chart__key k-chart__key--box" aria-hidden="true"></span><span class="k-pie__name">${esc(d.label)}</span><strong>${pctOf(d.value, total)}</strong><span class="k-pie__abs">${esc(f(d.value))}</span></li>`).join("")}</ul></div></figure>`;
    const plot = this.querySelector<HTMLElement>(".k-pie__plot")!;
    const center = this.querySelector(".k-pie__center");
    const mid = (i: number) => {
      const ang = ((arcs[i].start + arcs[i].len / 2) / C) * 2 * Math.PI - Math.PI / 2;
      const rr = donut ? r : r * 1.3;
      return { x: ((R + rr * Math.cos(ang)) / (2 * R)) * size, y: ((R + rr * Math.sin(ang)) / (2 * R)) * size - 8 };
    };
    const activate = (i: number | null) => {
      this.querySelectorAll<HTMLElement>("[data-i]").forEach((el) => el.toggleAttribute("data-active", Number(el.dataset.i) === i));
      if (center) center.innerHTML = i === null ? `<strong>${esc(f(total))}</strong><span>${esc(totalLabel)}</span>` : `<strong>${pctOf(parts[i].value, total)}</strong><span>${esc(parts[i].label)}</span>`;
      if (!donut) {
        if (i === null) this.tip(plot, null);
        else this.tip(plot, mid(i).x, mid(i).y, undefined, [{ name: parts[i].label, value: pctOf(parts[i].value, total), color: slot(i) }, { name: "تعداد", value: f(parts[i].value) }]);
      }
    };
    this.querySelectorAll<HTMLElement>(".k-pie__slice, .k-pie__legend li").forEach((el) => el.addEventListener("pointerenter", () => activate(Number(el.dataset.i))));
    plot.addEventListener("pointerleave", () => activate(null));
    this.querySelector(".k-pie__legend")!.addEventListener("pointerleave", () => activate(null));
  }
}

/** خط روند کوچک برای کارت آمار و جدول: values="12, 18, 15, 22" */
export class KashiSparkline extends Chart {
  static observedAttributes = ["values", "tone", "area", "label"];
  get values(): number[] {
    const v = this.props.values as number[] | undefined;
    return v ?? (this.getAttribute("values") ?? "").split(/[,،\s]+/).filter(Boolean).map(Number).filter((n) => !Number.isNaN(n));
  }
  set values(v: number[]) { this.write("values", v); }

  protected draw() {
    const values = this.values;
    if (!values.length) {
      this.innerHTML = "";
      return;
    }
    const hi = Math.max(...values), lo = Math.min(...values);
    // حداقل دامنه ۲۵٪ مقدار تا تغییر کوچک، زیگزاگ بزرگ دیده نشود
    const span = Math.max(hi - lo, Math.abs(hi) * 0.25) || 1;
    const min = (hi + lo) / 2 - span / 2;
    const d = values.map((v, i) => `${i ? "L" : "M"}${(i / Math.max(1, values.length - 1)) * 100},${28 - ((v - min) / span) * 24}`).join(" ");
    const tone = this.getAttribute("tone") ?? "brand";
    const c = tone === "neutral" ? "var(--k-text-tertiary)" : tone === "brand" ? "var(--k-text-brand)" : `var(--k-text-${tone})`;
    const label = this.getAttribute("label");
    this.innerHTML = `<svg class="k-sparkline" viewBox="0 0 100 30" preserveAspectRatio="none"${label ? ` role="img" aria-label="${esc(label)}"` : ' aria-hidden="true"'} style="color: ${c}">${this.getAttribute("area") !== "false" ? `<path d="${d} L100,30 L0,30 Z" fill="currentColor" opacity="0.1"></path>` : ""}<path d="${d}" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"></path></svg>`;
  }
}

/**
 * نمودار خطی تا چهار سری: labels='["فروردین", …]' و series='[{"name":"…","values":[…]}]'.
 * راهنمای عمودی با موس و ←→ روی کیبورد؛ محور زمان در RTL از راست شروع می‌شود.
 */
export class KashiLineChart extends Chart {
  static observedAttributes = ["label", "labels", "series", "unit", "area", "height"];
  private ro: ResizeObserver | null = null;
  private active: number | null = null;
  get labels() { return this.read<string[]>("labels", []); }
  set labels(v: string[]) { this.write("labels", v); }
  get series() { return this.read<Series[]>("series", []); }
  set series(v: Series[]) { this.write("series", v); }

  connectedCallback() {
    super.connectedCallback();
    if (typeof ResizeObserver !== "undefined" && !this.ro) {
      let w = 0;
      this.ro = new ResizeObserver(() => {
        const nw = this.clientWidth;
        if (nw && nw !== w) {
          w = nw;
          this.paintSvg();
        }
      });
      this.ro.observe(this);
    }
  }
  disconnectedCallback() {
    this.ro?.disconnect();
    this.ro = null;
  }

  protected draw() {
    const shown = this.series.slice(0, 4);
    const f = this.format;
    const labels = this.labels;
    const height = this.getAttribute("height");
    this.innerHTML = `<figure class="k-chart" aria-labelledby="${this.key}-t" style="margin: 0${height ? `; --k-chart-height: ${esc(height)}` : ""}"><figcaption class="k-chart__head"><p class="k-chart__title" id="${this.key}-t">${esc(this.heading)}</p>${shown.length > 1 ? `<ul class="k-chart__legend" aria-hidden="true">${shown.map((s, i) => `<li style="--_c: ${chartColor(i)}"><span class="k-chart__key"></span>${esc(s.name)}</li>`).join("")}</ul>` : ""}</figcaption><div class="k-chart__plot" tabindex="0" role="img" aria-label="${esc(`${this.heading}. با کلیدهای جهت بین نقطه‌ها حرکت کنید.`)}" aria-describedby="${this.key}-live"><svg class="k-chart__svg" aria-hidden="true" direction="ltr"></svg></div><span class="k-sr-only" aria-live="polite" id="${this.key}-live"></span><table class="k-sr-only"><caption>${esc(this.heading)}</caption><thead><tr><th scope="col">دوره</th>${shown.map((s) => `<th scope="col">${esc(s.name)}</th>`).join("")}</tr></thead><tbody>${labels.map((l, i) => `<tr><th scope="row">${esc(l)}</th>${shown.map((s) => `<td>${esc(f(s.values[i]))}</td>`).join("")}</tr>`).join("")}</tbody></table></figure>`;
    const plot = this.querySelector<HTMLElement>(".k-chart__plot")!;
    plot.addEventListener("pointermove", (e) => this.pick(e.clientX));
    plot.addEventListener("pointerleave", () => this.setActive(null));
    plot.addEventListener("blur", () => this.setActive(null));
    plot.addEventListener("keydown", (e) => {
      const rtl = getComputedStyle(plot).direction === "rtl";
      const n = labels.length;
      const next = ({ ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1 } as Record<string, number>)[e.key];
      if (next) {
        e.preventDefault();
        this.setActive(Math.min(n - 1, Math.max(0, (this.active ?? (next > 0 ? -1 : n)) + next)));
      } else if (e.key === "Home") this.setActive(0);
      else if (e.key === "End") this.setActive(n - 1);
      else if (e.key === "Escape") this.setActive(null);
    });
    this.active = null;
    this.paintSvg();
  }

  private geometry() {
    const plot = this.querySelector<HTMLElement>(".k-chart__plot")!;
    const shown = this.series.slice(0, 4);
    const labels = this.labels;
    const w = plot.clientWidth || 600, h = plot.clientHeight || 220;
    const rtl = getComputedStyle(plot).direction === "rtl";
    const pad = { top: 12, bottom: 24, start: 52, end: shown.length > 1 ? 64 : 16 };
    const ticks = niceTicks(Math.max(0, ...shown.flatMap((s) => s.values)));
    const top = ticks.at(-1) || 1;
    const innerW = Math.max(1, w - pad.start - pad.end), innerH = Math.max(1, h - pad.top - pad.bottom);
    // محور زمان در جهت خواندن صفحه: در RTL اولین نقطه سمت راست
    const x = (i: number) => {
      const t = labels.length > 1 ? i / (labels.length - 1) : 0.5;
      return rtl ? w - pad.start - t * innerW : pad.start + t * innerW;
    };
    const y = (v: number) => pad.top + innerH - (v / top) * innerH;
    return { plot, shown, labels, w, h, rtl, pad, ticks, innerW, innerH, x, y };
  }

  private paintSvg() {
    if (!this.querySelector(".k-chart__plot")) return;
    const { plot, shown, labels, w, h, rtl, pad, ticks, innerW, innerH, x, y } = this.geometry();
    const svg = plot.querySelector("svg")!;
    const tickX = rtl ? w - pad.start + 8 : pad.start - 8;
    const anchor = rtl ? "start" : "end";
    const last = labels.length - 1;
    // برچسب انتهای خط‌ها روی هم نیفتند: دست‌کم ۱۴ پیکسل فاصلهٔ عمودی
    const order = shown.map((s, i) => ({ i, y: y(s.values[last]) })).sort((a, b) => a.y - b.y);
    for (let k = 1; k < order.length; k++) if (order[k].y - order[k - 1].y < 14) order[k].y = order[k - 1].y + 14;
    const endY = Object.fromEntries(order.map((o) => [o.i, o.y]));
    const step = Math.max(1, Math.ceil(labels.length / Math.max(2, Math.floor(innerW / 64))));
    const fade = `${this.key}-fade`;
    const a = this.active;
    svg.innerHTML = `<g class="k-chart__grid">${ticks.map((t) => `<line x1="${pad.start}" x2="${w - pad.end}" y1="${y(t)}" y2="${y(t)}"${rtl ? ` transform="translate(${pad.end - pad.start} 0)"` : ""}></line>`).join("")}</g>${ticks.map((t) => `<text class="k-chart__tick" x="${tickX}" y="${y(t) + 4}" text-anchor="${anchor}">${esc(compact(t))}</text>`).join("")}${labels.map((l, i) => (i % step === 0 || i === last ? `<text class="k-chart__tick" x="${x(i)}" y="${h - 6}" text-anchor="middle">${esc(l)}</text>` : "")).join("")}<defs><linearGradient id="${fade}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color: var(--k-chart-1); stop-opacity: 0.28"></stop><stop offset="1" style="stop-color: var(--k-chart-1); stop-opacity: 0"></stop></linearGradient></defs>${shown.length === 1 && this.getAttribute("area") !== "false" ? `<path class="k-chart__area" fill="url(#${fade})" d="M${x(0)},${y(0)} ${shown[0].values.map((v, i) => `L${x(i)},${y(v)}`).join(" ")} L${x(last)},${y(0)} Z"></path>` : ""}${a !== null ? `<line class="k-chart__cross" x1="${x(a)}" x2="${x(a)}" y1="${pad.top}" y2="${pad.top + innerH}"></line>` : ""}${shown.map((s, si) => `<g style="--_c: ${chartColor(si)}"><path class="k-chart__line" pathLength="1" d="${s.values.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ")}"></path><circle class="k-chart__dot" cx="${x(s.values.length - 1)}" cy="${y(s.values.at(-1) ?? 0)}" r="4"></circle>${shown.length > 1 ? `<text class="k-chart__end" x="${x(last) + (rtl ? -8 : 8)}" y="${endY[si] + 4}" text-anchor="${rtl ? "end" : "start"}">${esc(s.name)}</text>` : ""}${a !== null ? `<circle class="k-chart__dot" cx="${x(a)}" cy="${y(s.values[a])}" r="4.5"></circle>` : ""}</g>`).join("")}`;
    const f = this.format;
    if (a === null) this.tip(plot, null);
    else this.tip(plot, x(a), Math.min(...shown.map((s) => y(s.values[a]))) - 6, labels[a], shown.map((s, si) => ({ name: s.name, value: f(s.values[a]), color: chartColor(si) })));
    this.querySelector(`#${this.key}-live`)!.textContent = a === null ? "" : `${labels[a]}: ${shown.map((s) => `${s.name} ${f(s.values[a])}`).join("، ")}`;
  }

  private pick(clientX: number) {
    const { plot, labels, x } = this.geometry();
    const px = clientX - plot.getBoundingClientRect().left;
    let best = 0;
    labels.forEach((_, i) => {
      if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i;
    });
    if (best !== this.active) this.setActive(best);
  }
  private setActive(i: number | null) {
    this.active = i;
    this.paintSvg();
  }
}

const WEEK = ["ش", "", "د", "", "چ", "", "ج"];

/** نقشهٔ فعالیت سالانه با ماه‌های شمسی: data='{"2026-03-21": 3, …}'، year="1405"، unit="فعالیت" */
export class KashiActivityHeatmap extends Chart {
  static observedAttributes = ["data", "year", "unit", "label"];
  get data() { return this.read<Record<string, number>>("data", {}); }
  set data(v: Record<string, number>) { this.write("data", v); }

  protected draw() {
    const data = this.data;
    const year = Number(this.getAttribute("year")) || toJalali(new Date()).jy;
    const unit = this.getAttribute("unit") ?? "فعالیت";
    const days: { date: Date; value: number }[] = [];
    for (let m = 1; m <= 12; m++) for (let d = 1; d <= jalaliMonthLength(year, m); d++) {
      const date = toGregorian(year, m, d);
      days.push({ date, value: data[toISODate(date)] ?? 0 });
    }
    const max = Math.max(0, ...days.map((d) => d.value));
    const level = (v: number) => (v <= 0 || max === 0 ? 0 : Math.max(1, Math.ceil((v / max) * 4)));
    // شنبه سطر اول
    const offset = (days[0].date.getDay() + 1) % 7;
    const col = (i: number) => Math.floor((i + offset) / 7);
    const months = JALALI_MONTHS.map((name, m) => ({ name, col: col(days.findIndex((d) => toJalali(d.date).jm === m + 1)) }));
    const total = days.reduce((s, d) => s + d.value, 0);
    const monthly = JALALI_MONTHS.map((name, m) => ({ name, sum: days.filter((d) => toJalali(d.date).jm === m + 1).reduce((s, d) => s + d.value, 0) }));
    const yearText = formatNumber(year).replace(/٬/g, "");
    const name = this.getAttribute("label") ?? `${unit} در سال ${yearText}`;
    this.innerHTML = `<figure class="k-heatmap" style="margin: 0"><div class="k-heatmap__scroll"><div role="img" aria-label="${esc(`${name}: ${formatNumber(total)} ${unit}`)}"><div class="k-heatmap__months" aria-hidden="true">${months.map((m) => `<span style="grid-column: ${m.col + 1}">${m.name}</span>`).join("")}</div><div class="k-heatmap__body" aria-hidden="true"><div class="k-heatmap__days">${WEEK.map((w) => `<span>${w}</span>`).join("")}</div><div class="k-heatmap__grid">${'<span class="k-heatmap__cell" data-empty=""></span>'.repeat(offset)}${days.map((d, i) => `<span class="k-heatmap__cell" data-l="${level(d.value)}" data-i="${i}"></span>`).join("")}</div></div></div></div><figcaption class="k-heatmap__foot"><span>${formatNumber(total)} ${esc(unit)} در ${yearText}</span><span class="k-heatmap__scale" aria-hidden="true">کمتر ${[0, 1, 2, 3, 4].map((l) => `<span class="k-heatmap__cell" data-l="${l}"></span>`).join("")} بیشتر</span></figcaption><table class="k-sr-only"><caption>${esc(name)}، به تفکیک ماه</caption><tbody>${monthly.map((m) => `<tr><th scope="row">${m.name}</th><td>${formatNumber(m.sum)}</td></tr>`).join("")}</tbody></table></figure>`;
    const fig = this.querySelector<HTMLElement>("figure")!;
    this.querySelector(".k-heatmap__grid")!.addEventListener("pointerover", (e) => {
      const cell = (e.target as HTMLElement).closest<HTMLElement>("[data-i]");
      fig.querySelector(".k-heatmap__cell[data-active]")?.removeAttribute("data-active");
      if (!cell) return this.tip(fig, null);
      cell.setAttribute("data-active", "");
      const p = this.at(cell, fig);
      const d = days[Number(cell.dataset.i)];
      this.tip(fig, p.x, p.y - 2, formatJalali(d.date, { style: "full" }), [{ value: `${formatNumber(d.value)} ${unit}` }]);
    });
    fig.addEventListener("pointerleave", () => this.tip(fig, null));
  }
}

define("kashi-bar-chart", KashiBarChart, "block");
define("kashi-line-chart", KashiLineChart, "block");
define("kashi-pie-chart", KashiPieChart, "block");
define("kashi-bar-list", KashiBarList, "block");
define("kashi-proportion-bar", KashiProportionBar, "block");
define("kashi-sparkline", KashiSparkline);
define("kashi-activity-heatmap", KashiActivityHeatmap, "block");
