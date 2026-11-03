import {
  JALALI_MONTHS, WEEKDAYS, WEEKDAYS_SHORT,
  formatJalali, fromISODate, getIranHoliday, jalaliMonthLength, jalaliWeekday, parseJalali, toFaDigits, toGregorian, toISODate, toJalali,
} from "@kashi-ui/persian";
import { HTMLBase, ICONS, bool, define, emit, esc, fieldHTML, setMessages, syncHidden, uid } from "./base.js";

const sameDay = (a?: Date | null, b?: Date | null) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

/** چند ماه شمسی جلو یا عقب؛ روز در ماه‌های کوتاه‌تر به آخر ماه می‌چسبد */
function addJalaliMonths(d: Date, n: number): Date {
  const { jy, jm, jd } = toJalali(d);
  const total = jy * 12 + (jm - 1) + n;
  const ny = Math.floor(total / 12);
  const nm = total - ny * 12 + 1;
  return toGregorian(ny, nm, Math.min(jd, jalaliMonthLength(ny, nm)));
}

/** تاریخ میلادی YYYY-MM-DD یا شمسی ۱۴۰۳/۰۵/۱۲ */
const parseDate = (text: string | null): Date | null => (text ? (fromISODate(text.trim()) ?? parseJalali(text)) : null);

/**
 * تقویم شمسی با الگوی grid در WAI-ARIA: پیمایش با فلش‌ها (در RTL فلش چپ یعنی روز بعد)،
 * PageUp/PageDown برای ماه و با Shift برای سال، Home/End برای ابتدا و انتهای هفته.
 */
export class KashiCalendar extends HTMLBase {
  static observedAttributes = ["value", "min", "max", "digits", "holidays", "label", "today-label", "name"];
  /** غیرفعال کردن روزهای خاص، مثلاً (d) => d.getDay() === 5 */
  isDateDisabled?: (date: Date) => boolean;
  /** نام تعطیلی هر روز؛ اگر ویژگی holidays گذاشته شود، تعطیلات ثابت ایران و جمعه‌ها */
  holidayOf?: (date: Date) => string | null | false | undefined;
  private selected: Date | null = null;
  private focused = startOfDay(new Date());
  private refocus = false;
  private rendered = false;
  private key = uid("kashi-cal");

  connectedCallback() {
    if (!this.rendered) {
      this.selected = parseDate(this.getAttribute("value"));
      this.focused = this.clamp(startOfDay(this.selected ?? new Date()));
      this.addEventListener("click", this.onClick);
      this.addEventListener("keydown", this.onKey);
      this.addEventListener("change", this.onSelect);
    }
    this.rendered = true;
    this.render();
  }

  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.rendered || old === next) return;
    if (name === "value") {
      this.selected = parseDate(next);
      if (this.selected) this.focused = startOfDay(this.selected);
    }
    this.render();
  }

  /** تاریخ انتخاب‌شده به شکل YYYY-MM-DD میلادی */
  get value(): string {
    return this.selected ? toISODate(this.selected) : "";
  }
  set value(v: string) {
    this.setAttribute("value", v ?? "");
  }
  get date(): Date | null {
    return this.selected;
  }
  set date(d: Date | null) {
    this.value = d ? toISODate(d) : "";
  }
  /** فوکوس روی روز انتخاب‌شده یا امروز */
  focus() {
    this.querySelector<HTMLButtonElement>('.k-calendar__day[tabindex="0"]')?.focus();
  }

  private get min() {
    return parseDate(this.getAttribute("min"));
  }
  private get max() {
    return parseDate(this.getAttribute("max"));
  }
  private clamp(d: Date): Date {
    const min = this.min, max = this.max;
    if (min && d < min) return startOfDay(min);
    if (max && d > max) return startOfDay(max);
    return d;
  }
  private disabled(d: Date) {
    const min = this.min, max = this.max;
    return (!!min && d < min) || (!!max && d > max) || !!this.isDateDisabled?.(d);
  }
  private holiday(d: Date): string | null {
    if (this.holidayOf) return this.holidayOf(d) || null;
    return bool(this, "holidays") ? getIranHoliday(d) : null;
  }

  private go(d: Date, focus = true) {
    this.focused = this.clamp(d);
    this.refocus = focus;
    this.render();
  }

  private pick(d: Date) {
    if (this.disabled(d)) return;
    this.selected = d;
    this.focused = d;
    this.refocus = true;
    this.render();
    syncHidden(this, this.getAttribute("name"), this.value);
    emit(this, "kashi-change", { value: this.value, date: d });
  }

  private onClick = (e: Event) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>("button");
    if (!btn || !this.contains(btn)) return;
    const nav = btn.dataset.nav;
    if (nav) this.go(addJalaliMonths(this.focused, nav === "prev" ? -1 : 1), false);
    else if (btn.dataset.today !== undefined) {
      const t = new Date();
      this.pick(new Date(t.getFullYear(), t.getMonth(), t.getDate()));
    } else if (btn.dataset.day) {
      const [y, m, d] = btn.dataset.day.split("-").map(Number);
      this.pick(new Date(y, m - 1, d));
    }
  };

  private onSelect = (e: Event) => {
    const sel = e.target as HTMLSelectElement;
    if (!sel.matches?.(".k-calendar__select")) return;
    e.stopPropagation();
    const { jy, jm, jd } = toJalali(this.focused);
    const ny = sel.dataset.part === "year" ? Number(sel.value) : jy;
    const nm = sel.dataset.part === "month" ? Number(sel.value) : jm;
    this.go(toGregorian(ny, nm, Math.min(jd, jalaliMonthLength(ny, nm))), false);
    this.querySelector<HTMLSelectElement>(`.k-calendar__select[data-part="${sel.dataset.part}"]`)?.focus();
  };

  private onKey = (e: KeyboardEvent) => {
    const btn = e.target as HTMLElement;
    if (!btn.classList?.contains("k-calendar__day")) return;
    const rtl = getComputedStyle(this).direction === "rtl";
    const f = this.focused;
    const wd = jalaliWeekday(f);
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(f, rtl ? 1 : -1),
      ArrowRight: () => addDays(f, rtl ? -1 : 1),
      ArrowUp: () => addDays(f, -7),
      ArrowDown: () => addDays(f, 7),
      Home: () => addDays(f, -wd),
      End: () => addDays(f, 6 - wd),
      PageUp: () => addJalaliMonths(f, e.shiftKey ? -12 : -1),
      PageDown: () => addJalaliMonths(f, e.shiftKey ? 12 : 1),
    };
    if (!moves[e.key]) return;
    e.preventDefault();
    this.go(moves[e.key]());
  };

  private render() {
    const digits = this.getAttribute("digits") === "latin" ? "latin" : "fa";
    const n = (v: number) => (digits === "fa" ? toFaDigits(v) : String(v));
    const today = startOfDay(new Date());
    const { jy, jm } = toJalali(this.focused);
    const monthStart = toGregorian(jy, jm, 1);
    const length = jalaliMonthLength(jy, jm);
    const cells: (Date | null)[] = [...Array<null>(jalaliWeekday(monthStart)).fill(null), ...Array.from({ length }, (_, i) => addDays(monthStart, i))];
    while (cells.length % 7) cells.push(null);
    const min = this.min, max = this.max;
    const from = min ? toJalali(min).jy : toJalali(today).jy - 100;
    const to = max ? toJalali(max).jy : toJalali(today).jy + 20;
    const years = Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
    if (!years.includes(jy)) years.push(jy);
    years.sort((a, b) => a - b);
    const prevOff = !!min && monthStart <= startOfDay(min);
    const nextOff = !!max && toGregorian(jy, jm, length) >= startOfDay(max);

    const rows: string[] = [];
    for (let w = 0; w < cells.length; w += 7) {
      rows.push(`<tr>${cells.slice(w, w + 7).map((d) => {
        if (!d) return '<td role="gridcell"></td>';
        const h = this.holiday(d);
        const label = formatJalali(d, { style: "full", digits }) + (h ? `، تعطیل${h === "جمعه" ? "" : `: ${h}`}` : "");
        return `<td role="gridcell" aria-selected="${sameDay(d, this.selected)}"><button type="button" class="k-calendar__day" data-day="${dayKey(d)}" tabindex="${sameDay(d, this.focused) ? 0 : -1}" aria-label="${esc(label)}"${h && h !== "جمعه" ? ` title="${esc(h)}"` : ""}${h ? ' data-holiday=""' : ""}${sameDay(d, today) ? ' aria-current="date"' : ""}${this.disabled(d) ? ' aria-disabled="true"' : ""}>${n(toJalali(d).jd)}</button></td>`;
      }).join("")}</tr>`);
    }
    const todayLabel = this.getAttribute("today-label");
    this.innerHTML = `<div class="k-calendar" role="group" aria-label="${esc(this.getAttribute("label") ?? "تقویم")}">
<div class="k-calendar__header">
<button type="button" class="k-btn k-btn--tertiary k-btn--icon k-btn--sm" data-nav="prev" aria-label="ماه قبل"${prevOff ? " disabled" : ""}>${ICONS.prev}</button>
<div class="k-calendar__selects">
<select class="k-calendar__select" data-part="month" aria-label="ماه">${JALALI_MONTHS.map((m, i) => `<option value="${i + 1}"${i + 1 === jm ? " selected" : ""}>${m}</option>`).join("")}</select>
<select class="k-calendar__select" data-part="year" aria-label="سال">${years.map((y) => `<option value="${y}"${y === jy ? " selected" : ""}>${n(y)}</option>`).join("")}</select>
</div>
<button type="button" class="k-btn k-btn--tertiary k-btn--icon k-btn--sm" data-nav="next" aria-label="ماه بعد"${nextOff ? " disabled" : ""}>${ICONS.next}</button>
</div>
<h2 class="k-sr-only" id="${this.key}-title" aria-live="polite">${JALALI_MONTHS[jm - 1]} ${n(jy)}</h2>
<table class="k-calendar__grid" role="grid" aria-labelledby="${this.key}-title">
<thead><tr>${WEEKDAYS_SHORT.map((s, i) => `<th scope="col" abbr="${WEEKDAYS[i]}">${s}</th>`).join("")}</tr></thead>
<tbody>${rows.join("")}</tbody>
</table>
${todayLabel ? `<div class="k-calendar__footer"><button type="button" class="k-btn k-btn--link" data-today>${esc(todayLabel)}</button></div>` : ""}
</div>`;
    syncHidden(this, this.getAttribute("name"), this.value);
    if (this.refocus) {
      this.refocus = false;
      this.querySelector<HTMLButtonElement>(`[data-day="${dayKey(this.focused)}"]`)?.focus();
    }
  }
}

/**
 * انتخاب تاریخ شمسی: تایپ مستقیم (۱۴۰۳/۰۵/۱۲) یا انتخاب از تقویم.
 * با name، تاریخ میلادی به شکل YYYY-MM-DD در فرم ارسال می‌شود.
 */
export class KashiDatePicker extends HTMLBase {
  static observedAttributes = ["label", "hint", "error", "required", "disabled", "value", "min", "max", "digits", "holidays", "name", "placeholder", "invalid-message", "aria-label"];
  isDateDisabled?: (date: Date) => boolean;
  private selected: Date | null = null;
  private invalid = false;
  private rendered = false;
  private key = uid("kashi-date");
  private input!: HTMLInputElement;
  private toggle!: HTMLButtonElement;
  private pop: HTMLElement | null = null;

  connectedCallback() {
    if (!this.rendered) this.selected = parseDate(this.getAttribute("value"));
    this.render();
  }
  disconnectedCallback() {
    this.close(false);
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.rendered || old === next) return;
    if (name === "value") {
      this.selected = parseDate(next);
      this.invalid = false;
      this.paint();
    } else this.render();
  }

  get value(): string {
    return this.selected ? toISODate(this.selected) : "";
  }
  set value(v: string) {
    this.selected = parseDate(v ?? "");
    this.invalid = false;
    if (this.rendered) this.paint();
  }
  get date(): Date | null {
    return this.selected;
  }
  set date(d: Date | null) {
    this.value = d ? toISODate(d) : "";
  }
  focus(options?: FocusOptions) {
    this.input?.focus(options);
  }

  private get digits(): "fa" | "latin" {
    return this.getAttribute("digits") === "latin" ? "latin" : "fa";
  }
  private fmt(d: Date | null) {
    return d ? formatJalali(d, { digits: this.digits }) : "";
  }

  private render() {
    const id = this.key;
    const ariaLabel = this.getAttribute("aria-label");
    const label = this.hasAttribute("label") ? this.getAttribute("label") : ariaLabel ? null : "تاریخ";
    const required = this.hasAttribute("required");
    const disabled = this.hasAttribute("disabled");
    const placeholder = this.getAttribute("placeholder") ?? (this.digits === "fa" ? "۱۴۰۳/۰۱/۰۱" : "1403/01/01");
    this.close(false);
    this.querySelector(":scope > .k-datepicker")?.remove();
    const control = `<div class="k-input"${disabled ? ' data-state="disabled"' : ""}><input id="${id}" class="k-input__control" type="text" dir="ltr" autocomplete="off" placeholder="${esc(placeholder)}"${required ? " required" : ""}${disabled ? " disabled" : ""}${!label && ariaLabel ? ` aria-label="${esc(ariaLabel)}"` : ""}><span class="k-input__addon"><button type="button" class="k-btn k-btn--tertiary k-btn--icon k-btn--sm k-datepicker__toggle" aria-haspopup="dialog" aria-expanded="false"${disabled ? " disabled" : ""}>${ICONS.calendar}</button></span></div>`;
    this.insertAdjacentHTML("afterbegin", `<div class="k-datepicker">${fieldHTML({ id, label, required, control })}</div>`);
    this.input = this.querySelector("input.k-input__control")!;
    this.toggle = this.querySelector(".k-datepicker__toggle")!;
    this.input.addEventListener("blur", () => this.commitText());
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.commitText();
    });
    this.toggle.addEventListener("click", () => (this.pop ? this.close() : this.open()));
    this.rendered = true;
    this.paint();
  }

  private paint() {
    const text = this.fmt(this.selected);
    if (!this.invalid && this.input.value !== text) this.input.value = text;
    const open = this.getAttribute("open-label") ?? "انتخاب تاریخ از تقویم";
    this.toggle.setAttribute("aria-label", this.selected ? `${open}، ${formatJalali(this.selected, { style: "full", digits: this.digits })}` : open);
    const message = this.getAttribute("invalid-message") ?? "این تاریخ معتبر نیست؛ آن را به شکل ۱۴۰۳/۰۵/۱۲ وارد کنید.";
    this.input.setCustomValidity(this.invalid ? message : "");
    setMessages(this.querySelector(".k-field")!, this.input, this.key, this.getAttribute("error") || (this.invalid ? message : null), this.getAttribute("hint"));
    syncHidden(this, this.getAttribute("name"), this.value);
  }

  private commitText() {
    const t = this.input.value.trim();
    if (!t) return this.commit(null);
    const d = parseJalali(t);
    const min = parseDate(this.getAttribute("min")), max = parseDate(this.getAttribute("max"));
    if (d && !(min && d < min) && !(max && d > max) && !this.isDateDisabled?.(d)) this.commit(d);
    else {
      this.invalid = true;
      this.paint();
    }
  }

  private commit(d: Date | null) {
    const changed = !sameDay(d, this.selected) || (d === null) !== (this.selected === null);
    this.selected = d;
    this.invalid = false;
    this.input.value = this.fmt(d);
    this.paint();
    if (changed) emit(this, "kashi-change", { value: this.value, date: d });
  }

  /** باز کردن تقویم */
  open() {
    if (this.pop || this.hasAttribute("disabled")) return;
    const wrap = this.querySelector(".k-datepicker")!;
    const box = this.querySelector<HTMLElement>(".k-input")!;
    const pop = document.createElement("div");
    pop.className = "k-datepicker__popover";
    pop.id = `${this.key}-calendar`;
    pop.setAttribute("role", "dialog");
    pop.setAttribute("aria-label", this.getAttribute("open-label") ?? "انتخاب تاریخ از تقویم");
    pop.style.insetBlockStart = `${box.offsetTop + box.offsetHeight + 6}px`;
    const cal = document.createElement("kashi-calendar") as KashiCalendar;
    for (const a of ["min", "max", "digits", "holidays"]) {
      const v = this.getAttribute(a);
      if (v !== null) cal.setAttribute(a, v);
    }
    if (this.selected) cal.setAttribute("value", toISODate(this.selected));
    cal.setAttribute("today-label", this.getAttribute("today-label") ?? "امروز");
    cal.isDateDisabled = this.isDateDisabled;
    cal.addEventListener("kashi-change", (e) => {
      e.stopPropagation();
      this.commit((e as CustomEvent<{ date: Date }>).detail.date);
      this.close();
    });
    pop.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        this.close();
      }
    });
    pop.addEventListener("focusout", (e) => {
      const next = e.relatedTarget as Node | null;
      if (next && !this.contains(next)) this.close(false);
    });
    pop.append(cal);
    wrap.append(pop);
    this.pop = pop;
    this.toggle.setAttribute("aria-expanded", "true");
    this.toggle.setAttribute("aria-controls", pop.id);
    document.addEventListener("pointerdown", this.onOutside);
    cal.focus();
  }

  /** بستن تقویم؛ فوکوس به دکمهٔ تقویم برمی‌گردد */
  close(returnFocus = true) {
    if (!this.pop) return;
    this.pop.remove();
    this.pop = null;
    document.removeEventListener("pointerdown", this.onOutside);
    this.toggle.setAttribute("aria-expanded", "false");
    this.toggle.removeAttribute("aria-controls");
    if (returnFocus) this.toggle.focus();
  }

  private onOutside = (e: PointerEvent) => {
    if (!this.contains(e.target as Node)) this.close(false);
  };
}

define("kashi-calendar", KashiCalendar, "block");
define("kashi-date-picker", KashiDatePicker, "block");
