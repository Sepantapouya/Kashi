import { JALALI_MONTHS, WEEKDAYS, formatJalali, formatTime, fromISODate, getIranHoliday, parseTime, toFaDigits, toISODate, toJalali } from "@kashi-ui/persian";
import { calendarNames, define, digitsOf, emit, esc, HTMLBase, lang, msg, uid } from "./base.js";

export interface AppointmentSlot {
  time: string;
  available?: boolean;
}

const PERIODS: ["morning" | "afternoon" | "evening", number][] = [["morning", 12], ["afternoon", 17], ["evening", 24]];
const day = (d: Date, add = 0) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + add);
const same = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const minutes = (t: string) => {
  const p = parseTime(t);
  return p ? p.hours * 60 + p.minutes : 0;
};
const CLOCK = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="M10 6v4l2.5 2"/></svg>';

/**
 * انتخاب نوبت: روزهای شمسی در یک ردیف (با تعداد نوبت خالی) و ساعت‌های همان روز در گروه‌های صبح، بعدازظهر و عصر.
 * ساعت کاری با from، to و step؛ نوبت‌های پر با booked (JSON) یا همهٔ ساعت‌ها با element.getSlots.
 * با name دو فیلد name_date (YYYY-MM-DD) و name_time در فرم ارسال می‌شوند.
 */
export class KashiAppointmentPicker extends HTMLBase {
  static observedAttributes = ["start", "days", "from", "to", "step", "booked", "closed", "label", "name", "digits", "value"];
  /** ساعت‌های هر روز به‌طور کامل: (date) => ["09:00", { time: "09:30", available: false }] */
  getSlots?: (date: Date) => (string | AppointmentSlot)[];
  /** روزهای تعطیل دلخواه؛ پیش‌فرض جمعه‌ها و تعطیلات رسمی ثابت */
  isClosed?: (date: Date) => boolean;
  private selected: { date: Date; time: string } | null = null;
  private active = -1;
  private valueSet = false;
  private rendered = false;
  private timer: ReturnType<typeof setInterval> | undefined;
  private key = uid("kashi-appt");

  connectedCallback() {
    if (!this.rendered && !this.valueSet) this.selected = this.parse(this.getAttribute("value"));
    this.render();
    // ساعت‌های گذشتهٔ امروز هر دقیقه پر می‌شوند
    clearInterval(this.timer);
    this.timer = setInterval(() => !this.contains(document.activeElement) && this.render(), 60_000);
  }
  disconnectedCallback() {
    clearInterval(this.timer);
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.rendered || old === next) return;
    if (name === "value") this.selected = this.parse(next);
    this.render();
  }

  /** «2026-11-04 10:30» */
  private parse(v: string | null) {
    const m = (v ?? "").trim().match(/^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}:\d{2})$/);
    const d = m ? fromISODate(m[1]) : null;
    return d && m ? { date: d, time: formatTime(parseTime(m[2])!) } : null;
  }
  /** نوبت انتخاب‌شده: { date, time } */
  get value(): { date: Date; time: string } | null {
    return this.selected ? { ...this.selected } : null;
  }
  set value(v: { date: Date; time: string } | null) {
    this.valueSet = true;
    this.selected = v ? { date: day(v.date), time: v.time } : null;
    if (this.rendered) this.render();
  }

  private list() {
    const now = new Date();
    const start = fromISODate(this.getAttribute("start") ?? "") ?? now;
    const count = Math.max(1, Number(this.getAttribute("days")) || 7);
    let booked: Record<string, string[]> = {};
    try {
      booked = JSON.parse(this.getAttribute("booked") ?? "{}");
    } catch { /* قالب نادرست نادیده گرفته می‌شود */ }
    const from = this.getAttribute("from") ?? "09:00", to = this.getAttribute("to") ?? "17:00";
    const step = Number(this.getAttribute("step")) || 30;
    const closedAttr = this.getAttribute("closed") !== "false";
    return Array.from({ length: count }, (_, i) => {
      const d = day(start, i);
      const closed = this.isClosed ? this.isClosed(d) : closedAttr && !!getIranHoliday(d, { locale: lang() });
      let slots: { time: string; available: boolean }[] = [];
      if (!closed) {
        if (this.getSlots) slots = this.getSlots(d).map((s) => (typeof s === "string" ? { time: s, available: true } : { time: s.time, available: s.available ?? true }));
        else {
          const taken = new Set(booked[toISODate(d)] ?? []);
          for (let m = minutes(from); m + step <= minutes(to); m += step) {
            const time = formatTime({ hours: Math.floor(m / 60), minutes: m % 60 });
            slots.push({ time, available: !taken.has(time) });
          }
        }
        if (same(d, now)) {
          const nm = now.getHours() * 60 + now.getMinutes();
          slots = slots.map((s) => (minutes(s.time) <= nm ? { ...s, available: false } : s));
        }
      }
      return { date: d, closed, slots, free: slots.filter((s) => s.available).length };
    });
  }

  private render(focus: "day" | "time" | null = null) {
    const now = new Date();
    const fa = digitsOf(this) === "fa";
    const n = (v: number | string) => (fa ? toFaDigits(String(v)) : String(v));
    const digits = fa ? "fa" : "latin";
    const list = this.list();
    if (this.active < 0 || this.active >= list.length) {
      const i = this.selected ? list.findIndex((x) => same(x.date, this.selected!.date)) : -1;
      this.active = i >= 0 ? i : Math.max(0, list.findIndex((x) => x.free > 0));
    }
    const cur = list[this.active];
    const M = msg(), A = M.appointment, { months, weekdays } = calendarNames(), locale = lang();
    const label = this.getAttribute("label") ?? A.label;
    const wd = (d: Date) => (same(d, now) ? M.common.today : same(d, day(now, 1)) ? M.common.tomorrow : weekdays[(d.getDay() + 1) % 7]);
    const daysHtml = list.map((x, i) => {
      const { jm, jd } = toJalali(x.date);
      const status = x.closed ? A.closed : x.free ? A.freeLong(n(x.free)) : A.none;
      return `<button type="button" role="radio" data-i="${i}" class="k-appt__day" aria-checked="${i === this.active}" tabindex="${i === this.active ? 0 : -1}"${x.closed ? " disabled" : ""} aria-label="${esc(`${formatJalali(x.date, { style: "full", digits, locale })}${M.common.list}${status}`)}"><span class="k-appt__weekday" aria-hidden="true">${wd(x.date)}</span><span class="k-appt__date" aria-hidden="true">${n(jd)}</span><span class="k-appt__month" aria-hidden="true">${months[jm - 1]}</span><span class="k-appt__free" aria-hidden="true">${x.closed ? A.closed : x.free ? A.free(n(x.free)) : A.full}</span></button>`;
    }).join("");
    const selDay = !!this.selected && same(this.selected.date, cur.date);
    const focusTime = selDay ? this.selected!.time : cur.slots.find((s) => s.available)?.time;
    const slotsHtml = cur.closed || !cur.free
      ? `<p class="k-appt__empty">${cur.closed ? A.closedDay : A.noSlots}</p>`
      : PERIODS.map(([title, until], k) => {
          const slots = cur.slots.filter((s) => minutes(s.time) / 60 < until && minutes(s.time) / 60 >= (k ? PERIODS[k - 1][1] : 0));
          if (!slots.length) return "";
          const gid = `${this.key}-p${k}`;
          return `<div class="k-appt__group"><p class="k-appt__period" id="${gid}">${A[title]}</p><div class="k-appt__times" role="radiogroup" aria-labelledby="${gid}">${slots.map((s) => `<button type="button" role="radio" class="k-appt__time" data-time="${s.time}" aria-checked="${selDay && this.selected!.time === s.time}" tabindex="${s.time === focusTime ? 0 : -1}"${s.available ? "" : " disabled"} aria-label="${esc(A.time(n(s.time)))}${s.available ? "" : esc(A.booked)}">${n(s.time)}</button>`).join("")}</div></div>`;
        }).join("");
    const name = this.getAttribute("name");
    const sel = this.selected;
    this.innerHTML = `<div class="k-appt" role="group" aria-labelledby="${this.key}-label"><p class="k-label" id="${this.key}-label" style="margin: 0">${esc(label)}</p><div class="k-appt__days" role="radiogroup" aria-label="${esc(A.day)}">${daysHtml}</div><div class="k-appt__slots">${slotsHtml}</div><p class="k-appt__summary" aria-live="polite">${sel ? `${CLOCK}<span>${esc(A.yours)} <strong>${esc(A.at(formatJalali(sel.date, { style: "full", digits, locale }), n(sel.time)))}</strong></span>` : ""}</p>${name ? `<input type="hidden" name="${esc(`${name}_date`)}" value="${sel ? toISODate(sel.date) : ""}"><input type="hidden" name="${esc(`${name}_time`)}" value="${sel?.time ?? ""}">` : ""}</div>`;
    this.rendered = true;
    const days = this.querySelector<HTMLElement>(".k-appt__days")!;
    const times = this.querySelector<HTMLElement>(".k-appt__slots")!;
    days.addEventListener("click", (e) => {
      const b = (e.target as Element).closest<HTMLButtonElement>(".k-appt__day");
      if (!b || b.disabled) return;
      this.active = Number(b.dataset.i);
      this.render("day");
    });
    times.addEventListener("click", (e) => {
      const b = (e.target as Element).closest<HTMLButtonElement>(".k-appt__time");
      if (!b || b.disabled) return;
      this.selected = { date: cur.date, time: b.dataset.time! };
      this.render("time");
      emit(this, "kashi-change", { date: toISODate(cur.date), time: this.selected.time, value: this.value });
    });
    days.addEventListener("keydown", (e) => this.roving(e, days, (b) => {
      this.active = Number(b.dataset.i);
      this.render("day");
    }));
    times.addEventListener("keydown", (e) => this.roving(e, times));
    if (focus === "day") days.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
    if (focus === "time") times.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    if (focus === "day") days.querySelector<HTMLElement>('[tabindex="0"]')?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }

  // فوکوس گردشی؛ در RTL فلش چپ یعنی بعدی
  private roving(e: KeyboardEvent, box: HTMLElement, onMove?: (b: HTMLButtonElement) => void) {
    const items = [...box.querySelectorAll<HTMLButtonElement>('[role="radio"]:not(:disabled)')];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const rtl = getComputedStyle(box).direction === "rtl";
    const step = ({ ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1, ArrowDown: 1, ArrowUp: -1 } as Record<string, number>)[e.key];
    const to = step ? (i + step + items.length) % items.length : e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : -1;
    if (to < 0) return;
    e.preventDefault();
    if (onMove) onMove(items[to]);
    else items[to].focus();
  }
}

define("kashi-appointment-picker", KashiAppointmentPicker, "block");
