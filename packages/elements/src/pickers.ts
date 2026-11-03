import { JALALI_MONTHS, formatJalali, fromISODate, parseJalali, toFaDigits, toGregorian, toISODate, toJalali } from "@kashi-ui/persian";
import { HTMLBase, ICONS, bool, define, emit, esc, fieldHTML, setMessages, uid } from "./base.js";
import type { KashiCalendar } from "./calendar.js";
import "./calendar.js";

const parseDate = (t: string | null) => (t ? (fromISODate(t.trim()) ?? parseJalali(t)) : null);
const day = (d: Date, add = 0) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + add);
const same = (a: Date | null, b: Date | null) => (!a && !b) || (!!a && !!b && a.getTime() === b.getTime());

interface Range {
  start: Date | null;
  end: Date | null;
}
const PRESETS: [string, (t: Date) => { start: Date; end: Date }][] = [
  ["۷ روز اخیر", (t) => ({ start: day(t, -6), end: t })],
  ["۳۰ روز اخیر", (t) => ({ start: day(t, -29), end: t })],
  ["این ماه", (t) => {
    const { jy, jm } = toJalali(t);
    return { start: toGregorian(jy, jm, 1), end: t };
  }],
  ["ماه قبل", (t) => {
    const { jy, jm } = toJalali(t);
    const [py, pm] = jm === 1 ? [jy - 1, 12] : [jy, jm - 1];
    return { start: toGregorian(py, pm, 1), end: day(toGregorian(jy, jm, 1), -1) };
  }],
];

/**
 * انتخاب بازهٔ تاریخ شمسی با تقویم و میان‌برها (۷ روز اخیر، این ماه، …).
 * با name دو فیلد name_start و name_end با تاریخ میلادی YYYY-MM-DD ارسال می‌شوند.
 */
export class KashiDateRangePicker extends HTMLBase {
  static observedAttributes = ["label", "hint", "error", "start", "end", "min", "max", "holidays", "digits", "name", "disabled", "presets", "placeholder"];
  private current: Range = { start: null, end: null };
  private draft: Range = { start: null, end: null };
  private valueSet = false;
  private rendered = false;
  private key = uid("kashi-range");
  private trigger!: HTMLButtonElement;
  private pop: HTMLElement | null = null;

  connectedCallback() {
    if (!this.rendered && !this.valueSet) this.current = { start: parseDate(this.getAttribute("start")), end: parseDate(this.getAttribute("end")) };
    this.render();
  }
  disconnectedCallback() {
    this.close(false);
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.rendered || old === next) return;
    if (name === "start" || name === "end") this.current = { ...this.current, [name]: parseDate(next) };
    this.render();
  }
  /** { start, end } با Date */
  get value(): Range {
    return { ...this.current };
  }
  set value(r: Range) {
    this.valueSet = true;
    this.current = { start: r?.start ?? null, end: r?.end ?? null };
    if (this.rendered) this.render();
  }

  private fmt(d: Date) {
    return formatJalali(d, { digits: this.getAttribute("digits") === "latin" ? "latin" : "fa" });
  }
  private text(r: Range) {
    return r.start && r.end ? `${this.fmt(r.start)} تا ${this.fmt(r.end)}` : null;
  }

  private render() {
    this.close(false);
    const id = this.key;
    const label = this.getAttribute("label") ?? "بازهٔ تاریخ";
    const text = this.text(this.current);
    const control = `<div class="k-datepicker k-daterange"><div class="k-select"><button id="${id}" type="button" class="k-select__control k-daterange__trigger" aria-haspopup="dialog" aria-expanded="false"${text ? "" : ' data-placeholder=""'}${this.hasAttribute("disabled") ? " disabled" : ""}>${ICONS.calendar}<span>${esc(text ?? this.getAttribute("placeholder") ?? "انتخاب بازهٔ تاریخ")}</span></button></div></div>`;
    this.querySelector(":scope > .k-field")?.remove();
    this.insertAdjacentHTML("afterbegin", fieldHTML({ id, label, control }));
    this.trigger = this.querySelector(".k-daterange__trigger")!;
    this.trigger.addEventListener("click", () => (this.pop ? this.close() : this.open()));
    this.rendered = true;
    setMessages(this.querySelector(":scope > .k-field")!, this.trigger, id, this.getAttribute("error"), this.getAttribute("hint"));
    const name = this.getAttribute("name");
    this.querySelectorAll(":scope > input[type=hidden]").forEach((el) => el.remove());
    if (name) {
      for (const [k, d] of [["start", this.current.start], ["end", this.current.end]] as const)
        this.insertAdjacentHTML("beforeend", `<input type="hidden" name="${esc(`${name}_${k}`)}" value="${d ? toISODate(d) : ""}">`);
    }
  }

  open() {
    if (this.pop || this.hasAttribute("disabled")) return;
    this.draft = { ...this.current };
    const wrap = this.querySelector(".k-daterange")!;
    const pop = document.createElement("div");
    pop.id = `${this.key}-popover`;
    pop.className = "k-datepicker__popover k-daterange__popover";
    pop.setAttribute("role", "dialog");
    pop.setAttribute("aria-label", this.getAttribute("label") ?? "انتخاب بازهٔ تاریخ");
    const presets = this.getAttribute("presets") === "false" ? [] : PRESETS;
    pop.innerHTML = `${presets.length ? `<ul class="k-daterange__presets" role="list" aria-label="میان‌برها">${presets.map(([l], i) => `<li><button type="button" class="k-daterange__preset" data-preset="${i}" aria-pressed="false">${l}</button></li>`).join("")}</ul>` : ""}<div class="k-daterange__main"><div class="k-daterange__footer"><span class="k-daterange__summary" aria-live="polite"></span><button type="button" class="k-btn k-btn--secondary k-btn--sm" data-cancel>انصراف</button><button type="button" class="k-btn k-btn--primary k-btn--sm" data-apply>تأیید</button></div></div>`;
    const cal = document.createElement("kashi-calendar") as KashiCalendar;
    for (const a of ["min", "max", "digits", "holidays"]) {
      const v = this.getAttribute(a);
      if (v !== null) cal.setAttribute(a, v);
    }
    cal.range = this.draft;
    pop.querySelector(".k-daterange__main")!.prepend(cal);
    cal.addEventListener("kashi-change", (e) => {
      e.stopPropagation();
      const d = (e as CustomEvent<{ date: Date }>).detail.date;
      const r = this.draft;
      this.draft = !r.start || r.end ? { start: d, end: null } : d < r.start ? { start: d, end: r.start } : { start: r.start, end: d };
      cal.range = this.draft;
      this.paintDraft();
    });
    pop.addEventListener("click", (e) => {
      const t = e.target as Element;
      const preset = t.closest<HTMLElement>("[data-preset]");
      if (preset) {
        this.draft = presets[Number(preset.dataset.preset)][1](day(new Date()));
        cal.range = this.draft;
        this.paintDraft();
      } else if (t.closest("[data-cancel]")) this.close();
      else if (t.closest("[data-apply]") && this.draft.start && this.draft.end) {
        const changed = !same(this.draft.start, this.current.start) || !same(this.draft.end, this.current.end);
        this.current = { ...this.draft };
        this.close();
        this.render();
        this.trigger.focus();
        if (changed) emit(this, "kashi-change", { start: this.current.start, end: this.current.end, value: { start: toISODate(this.current.start!), end: toISODate(this.current.end!) } });
      }
    });
    pop.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        this.close();
      }
    });
    wrap.append(pop);
    this.pop = pop;
    this.trigger.setAttribute("aria-expanded", "true");
    this.trigger.setAttribute("aria-controls", pop.id);
    document.addEventListener("pointerdown", this.onOutside);
    this.paintDraft();
    cal.focus();
  }

  private paintDraft() {
    const pop = this.pop!;
    const r = this.draft;
    pop.querySelector(".k-daterange__summary")!.textContent = this.text(r) ?? (r.start ? "حالا تاریخ پایان را انتخاب کنید." : "");
    pop.querySelector<HTMLButtonElement>("[data-apply]")!.disabled = !r.start || !r.end;
    const today = day(new Date());
    pop.querySelectorAll<HTMLElement>("[data-preset]").forEach((b, i) => {
      const p = PRESETS[i][1](today);
      b.setAttribute("aria-pressed", String(same(r.start, p.start) && same(r.end, p.end)));
    });
  }

  close(focus = true) {
    if (!this.pop) return;
    this.pop.remove();
    this.pop = null;
    document.removeEventListener("pointerdown", this.onOutside);
    this.trigger.setAttribute("aria-expanded", "false");
    this.trigger.removeAttribute("aria-controls");
    if (focus) this.trigger.focus();
  }
  private onOutside = (e: PointerEvent) => {
    if (!this.contains(e.target as Node)) this.close(false);
  };
}

const ARROW = (next: boolean) => `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-k-mirror=""><path d="${next ? "m8 5 5 5-5 5" : "m12 5-5 5 5 5"}"/></svg>`;

/** انتخاب ماه شمسی برای گزارش‌ها و فیلترها؛ مقدار «1405-01» (سال-ماه شمسی) */
export class KashiMonthPicker extends HTMLBase {
  static observedAttributes = ["value", "min", "max", "digits", "label", "name"];
  private selected: { year: number; month: number } | null = null;
  private year = toJalali(new Date()).jy;
  private focusMonth = 1;
  private valueSet = false;
  private rendered = false;

  connectedCallback() {
    if (!this.rendered) {
      if (!this.valueSet) this.selected = this.parse(this.getAttribute("value"));
      const t = toJalali(new Date());
      this.year = this.selected?.year ?? t.jy;
      this.focusMonth = this.selected?.month ?? (this.year === t.jy ? t.jm : 1);
    }
    this.render();
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.rendered || old === next) return;
    if (name === "value") this.value = next ?? "";
    else this.render();
  }
  private parse(v: string | null) {
    const m = (v ?? "").trim().match(/^(\d{4})[-/](\d{1,2})$/);
    return m ? { year: Number(m[1]), month: Number(m[2]) } : null;
  }
  /** «1405-01» */
  get value() {
    return this.selected ? `${this.selected.year}-${String(this.selected.month).padStart(2, "0")}` : "";
  }
  set value(v: string) {
    this.valueSet = true;
    this.selected = this.parse(v);
    if (this.selected) [this.year, this.focusMonth] = [this.selected.year, this.selected.month];
    if (this.rendered) this.render();
  }

  private out(y: number, m: number) {
    const k = y * 12 + m;
    const min = this.parse(this.getAttribute("min")), max = this.parse(this.getAttribute("max"));
    return (!!min && k < min.year * 12 + min.month) || (!!max && k > max.year * 12 + max.month);
  }

  private render(focus = false) {
    const f = (n: number) => (this.getAttribute("digits") === "latin" ? String(n) : toFaDigits(String(n)));
    const t = toJalali(new Date());
    const min = this.parse(this.getAttribute("min")), max = this.parse(this.getAttribute("max"));
    const y = this.year;
    this.innerHTML = `<div class="k-monthpicker" role="group" aria-label="${esc(this.getAttribute("label") ?? "انتخاب ماه")}"><div class="k-monthpicker__header"><button type="button" class="k-btn k-btn--tertiary k-btn--icon k-btn--sm" data-year="-1" aria-label="سال قبل"${min && y <= min.year ? " disabled" : ""}>${ARROW(false)}</button><span class="k-monthpicker__year" aria-live="polite">${f(y)}</span><button type="button" class="k-btn k-btn--tertiary k-btn--icon k-btn--sm" data-year="1" aria-label="سال بعد"${max && y >= max.year ? " disabled" : ""}>${ARROW(true)}</button></div><div class="k-monthpicker__grid">${JALALI_MONTHS.map((name, i) => `<button type="button" data-month="${i + 1}" class="k-monthpicker__month" tabindex="${this.focusMonth === i + 1 ? 0 : -1}" aria-pressed="${this.selected?.year === y && this.selected.month === i + 1}" aria-label="${name} ${f(y)}"${t.jy === y && t.jm === i + 1 ? ' aria-current="date"' : ""}${this.out(y, i + 1) ? " disabled" : ""}>${name}</button>`).join("")}</div></div>`;
    const name = this.getAttribute("name");
    if (name) this.insertAdjacentHTML("beforeend", `<input type="hidden" name="${esc(name)}" value="${this.value}">`);
    this.rendered = true;
    this.querySelectorAll<HTMLButtonElement>("[data-year]").forEach((b) => b.addEventListener("click", () => {
      this.year += Number(b.dataset.year);
      this.render();
    }));
    const grid = this.querySelector<HTMLElement>(".k-monthpicker__grid")!;
    grid.addEventListener("click", (e) => {
      const b = (e.target as Element).closest<HTMLButtonElement>("[data-month]");
      if (!b || b.disabled) return;
      this.selected = { year: this.year, month: Number(b.dataset.month) };
      this.focusMonth = this.selected.month;
      this.render(true);
      emit(this, "kashi-change", { value: this.value, year: this.selected.year, month: this.selected.month });
    });
    grid.addEventListener("keydown", (e) => {
      const rtl = getComputedStyle(grid).direction === "rtl";
      const delta: Record<string, number> = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1, ArrowDown: 3, ArrowUp: -3, PageUp: -12, PageDown: 12 };
      let idx = this.year * 12 + this.focusMonth - 1;
      if (e.key in delta) idx += delta[e.key];
      else if (e.key === "Home") idx = this.year * 12;
      else if (e.key === "End") idx = this.year * 12 + 11;
      else return;
      e.preventDefault();
      this.year = Math.floor(idx / 12);
      this.focusMonth = (idx % 12) + 1;
      this.render(true);
    });
    if (focus) this.querySelector<HTMLButtonElement>(`[data-month="${this.focusMonth}"]`)?.focus();
  }
}

/** حجم فایل به فارسی: «۱٫۲ مگابایت» */
export function formatBytes(bytes: number): string {
  const units = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"];
  let v = bytes, i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  const n = i === 0 ? String(v) : v.toFixed(v < 10 ? 1 : 0).replace(/\.0$/, "");
  return `${toFaDigits(n).replace(".", "٫")} ${units[i]}`;
}
const UPLOAD = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13V3.5m-4 4 4-4 4 4M4 13v2.5A1.5 1.5 0 0 0 5.5 17h9a1.5 1.5 0 0 0 1.5-1.5V13"/></svg>';
const TRASH = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 5.5h13M8 5.5V4h4v1.5M5 5.5l.8 10.2a1.5 1.5 0 0 0 1.5 1.3h5.4a1.5 1.5 0 0 0 1.5-1.3L15 5.5"/></svg>';

interface FileItem {
  id: string;
  file: File;
  status: "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

/**
 * بارگذاری فایل با کشیدن و رها کردن، بررسی نوع و حجم و فهرست فایل‌ها.
 * با name فایل‌ها با فرم HTML ارسال می‌شوند؛ برای بارگذاری فوری، element.uploader = (file, onProgress) => Promise بدهید.
 */
export class KashiFileUpload extends HTMLBase {
  static observedAttributes = ["accept", "multiple", "max-size", "max-files", "hint", "name", "disabled", "label"];
  /** بارگذاری هر فایل؛ onProgress(درصد) را صدا بزنید */
  uploader?: (file: File, onProgress: (percent: number) => void) => Promise<void>;
  private items: FileItem[] = [];
  private rendered = false;
  private key = uid("kashi-upload");
  private input!: HTMLInputElement;

  connectedCallback() {
    if (!this.rendered) this.render();
  }
  attributeChangedCallback(_n: string, old: string | null, next: string | null) {
    if (this.rendered && old !== next) this.render();
  }
  /** فایل‌های پذیرفته‌شده */
  get files(): File[] {
    return this.items.filter((i) => i.status !== "error").map((i) => i.file);
  }

  private get multiple() {
    return bool(this, "multiple", true);
  }

  private render() {
    const k = this.key;
    const hint = this.getAttribute("hint");
    const off = this.hasAttribute("disabled");
    const name = this.getAttribute("name");
    const accept = this.getAttribute("accept");
    this.innerHTML = `<div class="k-dropzone"${off ? ' data-disabled=""' : ""}><span class="k-dropzone__icon" aria-hidden="true">${UPLOAD}</span><p class="k-dropzone__title" style="margin: 0"><button type="button" class="k-dropzone__browse"${off ? " disabled" : ""}${hint ? ` aria-describedby="${k}-hint"` : ""}>${esc(this.getAttribute("label") ?? "انتخاب فایل")}</button> <span>یا فایل را اینجا رها کنید</span></p>${hint ? `<p class="k-dropzone__hint" id="${k}-hint" style="margin: 0">${esc(hint)}</p>` : ""}<input type="file" tabindex="-1" aria-hidden="true"${accept ? ` accept="${esc(accept)}"` : ""}${this.multiple ? " multiple" : ""}${name ? ` name="${esc(name)}"` : ""}></div><ul class="k-file-list" role="list" hidden></ul><span class="k-sr-only" aria-live="polite"></span>`;
    this.rendered = true;
    this.input = this.querySelector("input[type=file]")!;
    const zone = this.querySelector<HTMLElement>(".k-dropzone")!;
    this.querySelector(".k-dropzone__browse")!.addEventListener("click", () => this.input.click());
    this.input.addEventListener("change", () => {
      if (this.input.files?.length) this.add([...this.input.files]);
    });
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (!off) zone.setAttribute("data-dragging", "");
    });
    zone.addEventListener("dragleave", (e) => {
      if (!zone.contains(e.relatedTarget as Node)) zone.removeAttribute("data-dragging");
    });
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.removeAttribute("data-dragging");
      if (!off && e.dataTransfer?.files.length) this.add([...e.dataTransfer.files]);
    });
    this.querySelector(".k-file-list")!.addEventListener("click", (e) => {
      const b = (e.target as Element).closest<HTMLElement>("[data-remove]");
      if (!b) return;
      const it = this.items.find((x) => x.id === b.dataset.remove);
      this.items = this.items.filter((x) => x.id !== b.dataset.remove);
      this.announce(`${it?.file.name ?? ""} حذف شد`);
      this.changed();
    });
    this.paint();
  }

  private accepts(file: File) {
    const accept = this.getAttribute("accept");
    if (!accept) return true;
    return accept.split(",").map((a) => a.trim().toLowerCase()).some((a) =>
      a.startsWith(".") ? file.name.toLowerCase().endsWith(a) : a.endsWith("/*") ? file.type.startsWith(a.slice(0, -1)) : file.type === a,
    );
  }

  private add(files: File[]) {
    const list = this.multiple ? files : files.slice(0, 1);
    const maxSize = Number(this.getAttribute("max-size")) || 0;
    const maxFiles = Number(this.getAttribute("max-files")) || 0;
    const kept = this.multiple ? this.items.filter((i) => i.status !== "error").length : 0;
    const added: FileItem[] = list.map((file, i) => {
      let error: string | undefined;
      if (!this.accepts(file)) error = "این نوع فایل پذیرفته نیست.";
      else if (maxSize && file.size > maxSize) error = `حجم فایل بیشتر از ${formatBytes(maxSize)} است.`;
      else if (maxFiles && kept + i >= maxFiles) error = `حداکثر ${toFaDigits(maxFiles)} فایل.`;
      const up = !error && !!this.uploader;
      return { id: uid("f"), file, status: error ? "error" : up ? "uploading" : "done", progress: error ? 0 : up ? 0 : 100, error };
    });
    this.items = this.multiple ? [...this.items, ...added] : added;
    this.announce(added.map((a) => `${a.file.name}: ${a.error ?? (this.uploader ? "در حال بارگذاری" : "بارگذاری شد")}`).join("، "));
    this.changed();
    for (const it of added) {
      if (it.status !== "uploading" || !this.uploader) continue;
      this.uploader(it.file, (p) => {
        it.progress = p;
        this.paint();
      }).then(() => {
        it.status = "done";
        it.progress = 100;
        this.announce(`${it.file.name}: بارگذاری شد`);
        this.changed();
      }, (e: unknown) => {
        it.status = "error";
        it.error = e instanceof Error ? e.message : "خطا در بارگذاری";
        this.announce(`${it.file.name}: ${it.error}`);
        this.changed();
      });
    }
  }

  private announce(t: string) {
    this.querySelector(":scope > .k-sr-only")!.textContent = t;
  }

  private changed() {
    // فیلد file فرم همیشه همان فایل‌های پذیرفته‌شدهٔ فهرست را دارد
    try {
      const dt = new DataTransfer();
      for (const f of this.files) dt.items.add(f);
      this.input.files = dt.files;
    } catch { /* مرورگر قدیمی */ }
    this.paint();
    emit(this, "kashi-change", { files: this.files });
  }

  private paint() {
    const list = this.querySelector<HTMLElement>(".k-file-list")!;
    list.hidden = !this.items.length;
    const ext = (n: string) => (n.split(".").pop() ?? "").slice(0, 4).toUpperCase();
    list.innerHTML = this.items.map((it) => `<li class="k-file" data-status="${it.status}"><span class="k-file__icon" aria-hidden="true">${esc(ext(it.file.name))}</span><span class="k-file__name" title="${esc(it.file.name)}">${esc(it.file.name)}</span><button type="button" class="k-btn k-btn--tertiary k-btn--icon k-btn--sm k-file__remove" data-remove="${it.id}" aria-label="حذف ${esc(it.file.name)}">${TRASH}</button><span class="k-file__meta">${esc(it.error ?? `${formatBytes(it.file.size)}${it.status === "uploading" ? ` · ${toFaDigits(Math.round(it.progress))}٪` : it.status === "done" ? " · بارگذاری شد" : ""}`)}</span>${it.status === "uploading" ? `<div role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(it.progress)}" aria-label="در حال بارگذاری ${esc(it.file.name)}" class="k-progress k-progress--sm"><div class="k-progress__bar" style="--k-value: ${it.progress}%"></div></div>` : ""}</li>`).join("");
  }
}

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
const norm = (v: string) => {
  const m = v.trim().match(HEX);
  if (!m) return null;
  return `#${(m[1].length === 3 ? [...m[1]].map((c) => c + c).join("") : m[1]).toLowerCase()}`;
};
const rgbOf = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
const toHex = (r: number, g: number, b: number) => `#${[r, g, b].map((n) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0")).join("")}`;
const lum = (hex: string) => {
  const [r, g, b] = rgbOf(hex).map((n) => n / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
/** نسبت کنتراست دو رنگ طبق WCAG */
export const contrastRatio = (a: string, b: string) => {
  const [x, y] = [lum(norm(a) ?? a), lum(norm(b) ?? b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
type HSV = { h: number; s: number; v: number };
function hexToHsv(hex: string): HSV {
  const [r, g, b] = rgbOf(hex).map((n) => n / 255);
  const max = Math.max(r, g, b), d = max - Math.min(r, g, b);
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}
function hsvToHex({ h, s, v }: HSV) {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
  };
  return toHex(f(5), f(3), f(1));
}
const SWATCHES: [string, string][] = [["فیروزه‌ای", "#0b8077"], ["لاجوردی", "#2740ed"], ["بنفش", "#7c3aed"], ["اناری", "#e51d2a"], ["زعفرانی", "#dd5e02"], ["پسته‌ای", "#518b25"], ["شب", "#2a2f3d"]];
const SW_CHECK = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 10.5 3.2 3L15 7"/></svg>';

/**
 * انتخاب رنگ: رنگ‌های پیشنهادی، پنل اشباع و رنگ‌مایه، کد HEX و RGB، و کنتراست با متن سفید یا مشکی.
 * رنگ‌های پیشنهادی دلخواه با swatches="#0b8077 فیروزه‌ای, #2740ed لاجوردی".
 */
export class KashiColorPicker extends HTMLBase {
  static observedAttributes = ["label", "hint", "value", "name", "swatches", "show-contrast"];
  private current = "#0b8077";
  private hsv: HSV = hexToHsv("#0b8077");
  private valueSet = false;
  private rendered = false;
  private key = uid("kashi-color");
  private panel: HTMLElement | null = null;

  connectedCallback() {
    if (!this.rendered && !this.valueSet) this.setColor(norm(this.getAttribute("value") ?? "") ?? "#0b8077", false);
    this.render();
  }
  disconnectedCallback() {
    document.removeEventListener("pointerdown", this.onOutside);
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.rendered || old === next) return;
    if (name === "value") this.value = next ?? "";
    else this.render();
  }
  /** کد HEX، مثل «#0b8077» */
  get value() {
    return this.current;
  }
  set value(v: string) {
    this.valueSet = true;
    const h = norm(v ?? "");
    if (h) this.setColor(h, false);
    if (this.rendered) this.paint();
  }

  private setColor(hex: string, fromPanel: boolean) {
    this.current = hex;
    if (!fromPanel) {
      const n = hexToHsv(hex);
      this.hsv = n.s === 0 ? { ...n, h: this.hsv.h } : n;
    }
  }

  private swatches(): [string, string][] {
    const attr = this.getAttribute("swatches");
    if (attr === null) return SWATCHES;
    return attr.split(",").map((s) => s.trim().split(/\s+/)).filter(([h]) => norm(h)).map(([h, ...n]) => [n.join(" ") || h, norm(h)!]);
  }

  private render() {
    const k = this.key;
    const sw = this.swatches();
    const control = `<div class="k-color">${sw.length ? `<div class="k-color__swatches" role="radiogroup" aria-label="رنگ‌های پیشنهادی">${sw.map(([n, h]) => `<label class="k-color__swatch" style="--_sw: ${h}; --_ink: ${contrastRatio(h, "#ffffff") >= 3 ? "#fff" : "#000"}" title="${esc(n)}"><input type="radio" class="k-sr-only" name="${k}-sw" value="${h}" aria-label="${esc(n)}">${SW_CHECK}</label>`).join("")}</div>` : ""}<div class="k-color__row"><span class="k-color__anchor"><button type="button" class="k-color__preview" aria-label="انتخاب رنگ دلخواه" aria-haspopup="dialog" aria-expanded="false"></button></span><div class="k-input"><input id="${k}-hex" class="k-input__control" dir="ltr" spellcheck="false" autocomplete="off"></div></div>${this.getAttribute("show-contrast") === "false" ? "" : '<p class="k-color__contrast" aria-live="polite"><span class="k-color__sample">متن نمونه</span><span></span></p>'}</div>`;
    this.querySelector(":scope > .k-field")?.remove();
    this.insertAdjacentHTML("afterbegin", fieldHTML({ id: `${k}-hex`, label: this.getAttribute("label") ?? "رنگ", control }));
    this.rendered = true;
    this.querySelector(".k-color__swatches")?.addEventListener("change", (e) => this.pick((e.target as HTMLInputElement).value));
    const hex = this.querySelector<HTMLInputElement>(`#${k}-hex`)!;
    hex.addEventListener("input", () => {
      const h = norm(hex.value);
      this.paintMessages(!h);
      if (h) this.pick(h, false);
    });
    hex.addEventListener("blur", () => {
      if (norm(hex.value)) hex.value = this.current;
    });
    this.querySelector(".k-color__preview")!.addEventListener("click", () => (this.panel ? this.closePanel() : this.openPanel()));
    this.paint();
  }

  private pick(hex: string, syncText = true, fromPanel = false) {
    const changed = hex !== this.current;
    this.setColor(hex, fromPanel);
    this.paint(syncText);
    if (changed) emit(this, "kashi-change", { value: hex });
  }

  private paint(syncText = true) {
    const c = this.current;
    const white = contrastRatio(c, "#ffffff"), black = contrastRatio(c, "#000000");
    const ink = white >= black ? "#ffffff" : "#000000";
    const box = this.querySelector<HTMLElement>(".k-color")!;
    box.style.setProperty("--_sw", c);
    box.style.setProperty("--_ink", ink);
    this.querySelectorAll<HTMLInputElement>(".k-color__swatch input").forEach((r) => (r.checked = r.value === c));
    const hex = this.querySelector<HTMLInputElement>(`#${this.key}-hex`)!;
    if (syncText) hex.value = c;
    const best = Math.max(white, black);
    const out = this.querySelector(".k-color__contrast span:last-child");
    if (out) out.textContent = `کنتراست با متن ${ink === "#ffffff" ? "سفید" : "مشکی"}: ${toFaDigits((Math.round(best * 10) / 10).toFixed(1)).replace(".", "٫")} به ۱ ${best >= 4.5 ? "(AA)" : "(کمتر از AA)"}`;
    const name = this.getAttribute("name");
    this.querySelectorAll(":scope > input[type=hidden]").forEach((el) => el.remove());
    if (name) this.insertAdjacentHTML("beforeend", `<input type="hidden" name="${esc(name)}" value="${c}">`);
    if (this.panel) this.paintPanel();
    this.paintMessages(false);
  }
  private paintMessages(invalid: boolean) {
    const hex = this.querySelector<HTMLInputElement>(`#${this.key}-hex`)!;
    setMessages(this.querySelector(":scope > .k-field")!, hex, `${this.key}-hex`, invalid ? "کد رنگ معتبر نیست؛ مثل ‎#0fa89b‎ وارد کنید." : null, this.getAttribute("hint"));
  }

  private openPanel() {
    const anchor = this.querySelector(".k-color__anchor")!;
    const p = document.createElement("div");
    p.className = "k-color__panel";
    p.setAttribute("role", "dialog");
    p.setAttribute("aria-label", "انتخاب رنگ دلخواه");
    p.innerHTML = `<div class="k-color__area" role="slider" tabindex="0" aria-label="اشباع و روشنایی"><span class="k-color__thumb"></span></div><div class="k-color__tools"><span class="k-color__current" aria-hidden="true"></span><input type="range" class="k-color__hue" min="0" max="359" aria-label="رنگ‌مایه"></div><div class="k-color__codes" dir="ltr">${["R", "G", "B"].map((ch, i) => `<label class="k-color__code"><input class="k-color__num" inputmode="numeric" data-ch="${i}" aria-label="${["قرمز", "سبز", "آبی"][i]}"><span aria-hidden="true">${ch}</span></label>`).join("")}</div>`;
    anchor.append(p);
    this.panel = p;
    const area = p.querySelector<HTMLElement>(".k-color__area")!;
    const apply = (n: HSV) => {
      this.hsv = n;
      this.pick(hsvToHex(n), true, true);
    };
    const fromPointer = (e: PointerEvent) => {
      const r = area.getBoundingClientRect();
      apply({ ...this.hsv, s: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), v: 1 - Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) });
    };
    area.addEventListener("pointerdown", (e) => {
      area.setPointerCapture?.(e.pointerId);
      fromPointer(e);
    });
    area.addEventListener("pointermove", (e) => e.buttons === 1 && fromPointer(e));
    area.addEventListener("keydown", (e) => {
      const step = e.shiftKey ? 0.1 : 0.01;
      const h = this.hsv;
      const k: Record<string, Partial<HSV>> = {
        ArrowLeft: { s: Math.max(0, h.s - step) }, ArrowRight: { s: Math.min(1, h.s + step) },
        ArrowUp: { v: Math.min(1, h.v + step) }, ArrowDown: { v: Math.max(0, h.v - step) },
      };
      if (!k[e.key]) return;
      e.preventDefault();
      apply({ ...h, ...k[e.key] });
    });
    p.querySelector<HTMLInputElement>(".k-color__hue")!.addEventListener("input", (e) => apply({ ...this.hsv, h: Number((e.target as HTMLInputElement).value) }));
    p.querySelectorAll<HTMLInputElement>(".k-color__num").forEach((el) => el.addEventListener("input", () => {
      const rgb = rgbOf(this.current);
      rgb[Number(el.dataset.ch)] = Math.min(255, Math.max(0, Number(el.value.replace(/\D/g, "")) || 0));
      this.pick(toHex(...rgb));
    }));
    p.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        this.closePanel();
      }
    });
    this.querySelector(".k-color__preview")!.setAttribute("aria-expanded", "true");
    document.addEventListener("pointerdown", this.onOutside);
    this.paintPanel();
    area.focus({ preventScroll: true });
  }

  private paintPanel() {
    const p = this.panel!;
    const { h, s, v } = this.hsv;
    const pct = (n: number) => `${toFaDigits(Math.round(n * 100))}٪`;
    const area = p.querySelector<HTMLElement>(".k-color__area")!;
    area.style.setProperty("--_hue", `hsl(${h} 100% 50%)`);
    area.setAttribute("aria-valuenow", String(Math.round(s * 100)));
    area.setAttribute("aria-valuetext", `اشباع ${pct(s)}، روشنایی ${pct(v)}`);
    const thumb = p.querySelector<HTMLElement>(".k-color__thumb")!;
    thumb.style.left = `${s * 100}%`;
    thumb.style.top = `${(1 - v) * 100}%`;
    const hue = p.querySelector<HTMLInputElement>(".k-color__hue")!;
    hue.value = String(Math.round(h));
    hue.setAttribute("aria-valuetext", `${toFaDigits(Math.round(h))} درجه`);
    const rgb = rgbOf(this.current);
    p.querySelectorAll<HTMLInputElement>(".k-color__num").forEach((el, i) => {
      if (document.activeElement !== el) el.value = String(rgb[i]);
    });
  }

  private closePanel(focus = true) {
    if (!this.panel) return;
    this.panel.remove();
    this.panel = null;
    document.removeEventListener("pointerdown", this.onOutside);
    const btn = this.querySelector<HTMLButtonElement>(".k-color__preview")!;
    btn.setAttribute("aria-expanded", "false");
    if (focus) btn.focus();
  }
  private onOutside = (e: PointerEvent) => {
    if (!this.querySelector(".k-color__anchor")?.contains(e.target as Node)) this.closePanel(false);
  };
}

define("kashi-date-range-picker", KashiDateRangePicker, "block");
define("kashi-month-picker", KashiMonthPicker, "block");
define("kashi-file-upload", KashiFileUpload, "block");
define("kashi-color-picker", KashiColorPicker, "block");
