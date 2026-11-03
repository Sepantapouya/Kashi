import { EMPTY_ADDRESS, PROVINCES, formatNumber, getCities, type IranAddress } from "@kashi-ui/persian";
import { HTMLBase, afterParse, bool, define, emit, esc, uid } from "./base.js";
import { IRAN_PROVINCES, IRAN_VIEWBOX } from "./iranMapData.js";
// فرم نشانی از این عنصرها ساخته شده؛ با import همین فایل به‌تنهایی هم ثبت شوند
import "./combobox.js";
import "./inputs.js";
import type { KashiCitySelect, KashiProvinceSelect } from "./combobox.js";
import type { KashiPostalCode } from "./inputs.js";

const NAMES = PROVINCES.map((p) => p.name);
const CAPITAL = Object.fromEntries(PROVINCES.map((p) => [p.name, p.capital]));
const [, , VW, VH] = IRAN_VIEWBOX.split(" ").map(Number);

/**
 * نقشهٔ ۳۱ استان ایران: نقشهٔ رنگی برای داده (ویژگی data) و/یا انتخاب یک یا چند استان،
 * با صفحه‌کلید (فوکوس گردشی و جهت‌نماها) و جدول هم‌ارز برای صفحه‌خوان.
 */
export class KashiIranMap extends HTMLBase {
  static observedAttributes = ["data", "value", "label", "unit", "steps", "scale", "legend", "selectable", "multiple", "name"];
  private values: Record<string, number> | null = null;
  private selected: string[] = [];
  private active = 0;
  private rendered = false;
  private valueSet = false;
  private key = uid("kashi-map");

  connectedCallback() {
    if (!this.rendered) {
      if (!this.valueSet) this.selected = (this.getAttribute("value") ?? "").split(/[,،]/).map((s) => s.trim()).filter((s) => NAMES.includes(s));
      if (this.values === null) this.values = this.parseData(this.getAttribute("data"));
    }
    this.render();
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.rendered || old === next) return;
    if (name === "data") this.values = this.parseData(next);
    if (name === "value") {
      this.value = next ?? "";
      return;
    }
    this.render();
  }

  private parseData(text: string | null): Record<string, number> | null {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  /** داده برای نقشهٔ رنگی: نام استان ← عدد */
  get data(): Record<string, number> | null {
    return this.values;
  }
  set data(d: Record<string, number> | null) {
    this.values = d;
    if (this.rendered) this.render();
  }
  /** استان انتخاب‌شده؛ در حالت multiple، نام‌ها با «,» جدا می‌شوند */
  get value(): string {
    return this.selected.join(",");
  }
  set value(v: string) {
    this.valueSet = true;
    this.selected = String(v ?? "").split(/[,،]/).map((s) => s.trim()).filter((s) => NAMES.includes(s));
    if (!this.multiple) this.selected = this.selected.slice(0, 1);
    if (this.rendered) this.paint();
  }
  /** استان‌های انتخاب‌شده به‌شکل آرایه */
  get selectedProvinces(): string[] {
    return [...this.selected];
  }

  private get multiple() {
    return bool(this, "multiple");
  }
  private get selectable() {
    return this.multiple || bool(this, "selectable") || this.hasAttribute("value") || this.hasAttribute("name");
  }
  private fmt(n: number) {
    return formatNumber(n);
  }

  private level(n: string): number | undefined {
    const data = this.values;
    const v = data?.[n];
    if (typeof v !== "number" || !data) return undefined;
    const steps = this.steps;
    const vals = NAMES.map((x) => data[x]).filter((x): x is number => typeof x === "number");
    const min = Math.min(...vals), max = Math.max(...vals);
    if (max === min) return steps;
    // رتبهٔ اولین مقدار برابر، تا استان‌های هم‌مقدار یک رنگ بگیرند
    if (this.getAttribute("scale") !== "linear") {
      const sorted = [...vals].sort((a, b) => a - b);
      return 1 + Math.round((sorted.indexOf(v) * (steps - 1)) / (sorted.length - 1));
    }
    return Math.min(steps, 1 + Math.floor(((v - min) / (max - min)) * steps));
  }
  private get steps() {
    return Number(this.getAttribute("steps")) || 5;
  }
  // شدت رنگ هر پله؛ کم‌رنگ‌ترین پله هم از خاکستری «بدون داده» جدا دیده شود
  private shade(l: number) {
    return `${Math.round(12 + (88 * l) / this.steps)}%`;
  }
  private describe(n: string) {
    const v = this.values?.[n];
    const unit = this.getAttribute("unit");
    return typeof v === "number" ? `${n}: ${this.fmt(v)}${unit ? ` ${unit}` : ""}` : n;
  }

  private render() {
    const label = this.getAttribute("label") ?? "نقشهٔ استان‌های ایران";
    const sel = this.selectable;
    const multi = this.multiple;
    const data = this.values;
    const unit = this.getAttribute("unit");
    const paths = NAMES.map((n, i) => {
      const l = this.level(n);
      return `<path d="${IRAN_PROVINCES[n].d}" class="k-iran-map__province" data-i="${i}"${l ? ` data-l="${l}" style="--_p: ${this.shade(l)}"` : ""}${sel ? ` role="${multi ? "checkbox" : "radio"}" aria-label="${esc(this.describe(n))}"` : ""}></path>`;
    }).join("");
    const vals = data ? NAMES.map((n) => data[n]).filter((v): v is number => typeof v === "number") : [];
    const showLegend = this.hasAttribute("legend") ? bool(this, "legend") : !!data;
    const legend = showLegend && vals.length
      ? `<figcaption class="k-iran-map__legend"><span>${this.fmt(Math.min(...vals))}</span><span class="k-iran-map__scale" aria-hidden="true">${Array.from({ length: this.steps }, (_, i) => `<i style="--_p: ${this.shade(i + 1)}"></i>`).join("")}</span><span>${this.fmt(Math.max(...vals))}${unit ? ` ${esc(unit)}` : ""}</span></figcaption>`
      : "";
    const table = data
      ? `<table class="k-sr-only"><caption>${esc(label)}</caption><tbody>${NAMES.filter((n) => typeof data[n] === "number").sort((a, b) => data[b] - data[a]).map((n) => `<tr><th scope="row">${esc(n)}</th><td>${this.fmt(data[n])}${unit ? ` ${esc(unit)}` : ""}</td></tr>`).join("")}</tbody></table>`
      : "";
    // نسبت ابعاد با aspect-ratio، نه padding درصدی: در چیدمان flex ستونی ارتفاع padding درصدی صفر حساب می‌شود
    this.innerHTML = `<figure class="k-iran-map${sel ? " k-iran-map--selectable" : ""}"><div class="k-iran-map__canvas" style="block-size: auto; aspect-ratio: ${VW} / ${VH}"><svg viewBox="${IRAN_VIEWBOX}" class="k-iran-map__svg" role="${sel ? (multi ? "group" : "radiogroup") : "img"}" aria-label="${esc(sel ? label : `${label}${data ? "؛ جدول داده در ادامه" : ""}`)}">${paths}</svg><div class="k-chart__tip" aria-hidden="true" style="display: none"></div></div>${legend}${table}</figure>`;
    const svg = this.querySelector("svg")!;
    const fig = this.querySelector("figure")!;
    svg.addEventListener("pointerover", (e) => {
      const i = (e.target as Element).getAttribute?.("data-i");
      if (i !== null && i !== undefined) this.tip(Number(i));
    });
    fig.addEventListener("pointerleave", () => this.tip(null));
    if (sel) {
      svg.addEventListener("click", (e) => {
        const i = (e.target as Element).getAttribute?.("data-i");
        if (i === null || i === undefined) return;
        this.active = Number(i);
        this.toggle(NAMES[this.active]);
      });
      svg.addEventListener("keydown", (e) => this.onKey(e));
      svg.addEventListener("focusin", (e) => {
        const i = (e.target as Element).getAttribute?.("data-i");
        if (i !== null && i !== undefined) {
          this.active = Number(i);
          this.tip(this.active);
        }
      });
      svg.addEventListener("focusout", () => this.tip(null));
    }
    this.rendered = true;
    this.paint();
  }

  private paint() {
    const sel = this.selectable;
    const first = NAMES.findIndex((n) => this.selected.includes(n));
    const inside = this.contains(document.activeElement);
    const stop = inside || first < 0 ? this.active : first;
    this.querySelectorAll<SVGPathElement>(".k-iran-map__province").forEach((p, i) => {
      const on = this.selected.includes(NAMES[i]);
      p.toggleAttribute("data-selected", on);
      if (sel) {
        p.setAttribute("aria-checked", String(on));
        p.setAttribute("tabindex", i === stop ? "0" : "-1");
      }
    });
    const name = this.getAttribute("name");
    this.querySelectorAll(":scope > input[type=hidden]").forEach((el) => el.remove());
    if (name) {
      for (const v of this.multiple ? this.selected : [this.selected[0] ?? ""]) {
        const h = document.createElement("input");
        h.type = "hidden";
        h.name = name;
        h.value = v;
        this.append(h);
      }
    }
  }

  private toggle(n: string) {
    if (this.multiple) this.selected = this.selected.includes(n) ? this.selected.filter((x) => x !== n) : [...this.selected, n];
    else this.selected = this.selected[0] === n ? [] : [n];
    this.paint();
    emit(this, "kashi-change", { value: this.multiple ? [...this.selected] : (this.selected[0] ?? null) });
  }

  // فوکوس گردشی: یک استان در ترتیب Tab است و جهت‌نماها بین استان‌ها جابه‌جا می‌شوند
  private onKey(e: KeyboardEvent) {
    const i = this.active;
    const move = ({ ArrowLeft: 1, ArrowDown: 1, ArrowRight: -1, ArrowUp: -1 } as Record<string, number>)[e.key];
    let next = i;
    if (move) next = (i + move + NAMES.length) % NAMES.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = NAMES.length - 1;
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.toggle(NAMES[i]);
      return;
    } else return;
    e.preventDefault();
    this.active = next;
    this.paint();
    this.querySelector<SVGPathElement>(`[data-i="${next}"]`)?.focus();
  }

  private tip(i: number | null) {
    const box = this.querySelector<HTMLElement>(".k-chart__tip");
    if (!box) return;
    this.querySelector(".k-iran-map__province[data-active]")?.removeAttribute("data-active");
    // display: grid در CSS بر hidden غلبه می‌کند؛ پس با style پنهان می‌شود
    if (i === null) {
      box.style.display = "none";
      return;
    }
    const n = NAMES[i];
    this.querySelector(`[data-i="${i}"]`)?.setAttribute("data-active", "");
    const p = IRAN_PROVINCES[n];
    const w = this.querySelector("figure")!.clientWidth || VW;
    const v = this.values?.[n];
    const unit = this.getAttribute("unit");
    const row = typeof v === "number" ? `${this.fmt(v)}${unit ? ` ${unit}` : ""}` : `مرکز: ${CAPITAL[n]}`;
    box.innerHTML = `<span class="k-chart__tip-title">${esc(n)}</span><span class="k-chart__tip-row"><strong>${esc(row)}</strong></span>`;
    // داخل ظرف بماند و راهنمای استان‌های شمالی بالای نقشه بیرون نزند
    box.style.left = `${Math.min(Math.max((p.x / VW) * w, 80), w - 80)}px`;
    box.style.top = `${Math.max(64, (p.y / VH) * (w * (VH / VW)) - 6)}px`;
    box.style.display = "";
  }
}

type Field = keyof IranAddress;
const LABELS: Record<Field, string> = { province: "استان", city: "شهر", street: "نشانی", plaque: "پلاک", unit: "واحد", postalCode: "کد پستی" };

/**
 * فرم نشانی ایرانی: استان، شهرِ همان استان، نشانی، پلاک، واحد و کد پستی ده‌رقمی؛ با map نقشهٔ ایران برای انتخاب استان.
 * با انتخاب شهر بدون استان، استان خودکار پر می‌شود و با عوض شدن استان، شهرِ نامربوط پاک می‌شود.
 * با name="shipping" فیلدها به‌شکل shipping[province]، shipping[city]، … در فرم HTML ارسال می‌شوند.
 */
export class KashiAddressForm extends HTMLBase {
  static observedAttributes = ["legend", "name", "map", "required", "disabled"];
  private address: IranAddress = { ...EMPTY_ADDRESS };
  private built = false;
  private key = uid("kashi-address");

  connectedCallback() {
    afterParse(() => {
      if (!this.isConnected) return;
      if (!this.built) {
        const v = Object.prototype.hasOwnProperty.call(this, "value") ? (this as { value?: Partial<IranAddress> }).value : null;
        delete (this as { value?: unknown }).value;
        const attr = this.getAttribute("value");
        let initial: Partial<IranAddress> = v ?? {};
        if (!v && attr) try { initial = JSON.parse(attr); } catch { /* قالب نادرست نادیده گرفته می‌شود */ }
        this.address = { ...EMPTY_ADDRESS, ...initial };
      }
      this.render();
    });
  }
  attributeChangedCallback(_n: string, old: string | null, next: string | null) {
    if (this.built && old !== next) this.render();
  }

  /** نشانی کامل؛ مثل { province: "اصفهان", city: "کاشان", street, plaque, unit, postalCode } */
  get value(): IranAddress {
    return { ...this.address };
  }
  set value(v: Partial<IranAddress>) {
    this.address = { ...EMPTY_ADDRESS, ...v };
    if (this.built) this.render();
  }
  /** خطای هر فیلد، مثلاً از اعتبارسنجی سرور: { plaque: "پلاک را بنویسید." } */
  set errors(e: Partial<Record<Field, string>>) {
    for (const f of Object.keys(LABELS) as Field[]) {
      const el = this.querySelector(`[data-field="${f}"]`);
      if (!el) continue;
      if (el.matches("kashi-province-select, kashi-city-select, kashi-postal-code")) {
        if (e[f]) el.setAttribute("error", e[f]!);
        else el.removeAttribute("error");
      } else this.fieldError(el as HTMLElement, e[f] ?? null);
    }
  }

  private label(f: Field) {
    return this.getAttribute(`label-${f === "postalCode" ? "postal-code" : f}`) ?? LABELS[f];
  }

  private render() {
    const a = this.address;
    const name = this.getAttribute("name");
    const n = (f: Field) => (name ? ` name="${esc(`${name}[${f}]`)}"` : "");
    const req = bool(this, "required", true);
    const r = req ? " required" : "";
    const map = bool(this, "map");
    const k = this.key;
    const reqMark = req ? '<span class="k-label__required" aria-hidden="true">*</span>' : "";
    const legend = this.getAttribute("legend") ?? "نشانی";
    this.innerHTML = `<fieldset class="k-address${map ? " k-address--map" : ""}"${this.hasAttribute("disabled") ? " disabled" : ""}>
${legend ? `<legend class="k-address__legend">${esc(legend)}</legend>` : ""}
<div class="k-address__fields">
<kashi-province-select class="k-address__province" data-field="province" label="${esc(this.label("province"))}" show-capital="false" placeholder="جستجوی استان"${n("province")}${r}></kashi-province-select>
<kashi-city-select class="k-address__city" data-field="city" label="${esc(this.label("city"))}"${n("city")}${r}></kashi-city-select>
<div class="k-field k-address__street" data-field="street"><div class="k-field__label-row"><label class="k-label" for="${k}-street">${esc(this.label("street"))}${reqMark}</label></div><div class="k-input k-input--textarea k-input--autoresize"><textarea id="${k}-street" class="k-input__control" rows="2" autocomplete="street-address" placeholder="خیابان، کوچه، نام ساختمان"${n("street")}${r}></textarea></div></div>
<div class="k-field k-address__plaque" data-field="plaque"><div class="k-field__label-row"><label class="k-label" for="${k}-plaque">${esc(this.label("plaque"))}${reqMark}</label></div><div class="k-input"><input id="${k}-plaque" class="k-input__control" inputmode="numeric" autocomplete="address-line2"${n("plaque")}${r}></div></div>
<div class="k-field k-address__unit" data-field="unit"><div class="k-field__label-row"><label class="k-label" for="${k}-unit">${esc(this.label("unit"))}${req ? '<span class="k-label__optional">اختیاری</span>' : ""}</label></div><div class="k-input"><input id="${k}-unit" class="k-input__control" inputmode="numeric" autocomplete="address-line3"${n("unit")}></div></div>
<kashi-postal-code class="k-address__postal" data-field="postalCode" label="${esc(this.label("postalCode"))}"${n("postalCode")}${r}></kashi-postal-code>
</div>
${map ? `<kashi-iran-map class="k-address__map" selectable label="${esc(`${this.label("province")} روی نقشه`)}"></kashi-iran-map>` : ""}
</fieldset>`;
    this.built = true;
    const province = this.querySelector<KashiProvinceSelect>("kashi-province-select")!;
    const city = this.querySelector<KashiCitySelect>("kashi-city-select")!;
    const postal = this.querySelector<KashiPostalCode>("kashi-postal-code")!;
    const mapEl = this.querySelector<KashiIranMap>("kashi-iran-map");
    const street = this.querySelector<HTMLTextAreaElement>("textarea")!;
    const plaque = this.querySelector<HTMLInputElement>(`#${k}-plaque`)!;
    const unit = this.querySelector<HTMLInputElement>(`#${k}-unit`)!;
    if (a.province) province.value = a.province;
    if (a.province) city.setAttribute("province", a.province);
    if (a.city) city.value = a.city;
    postal.value = a.postalCode;
    street.value = a.street;
    plaque.value = a.plaque;
    unit.value = a.unit;
    if (mapEl && a.province) mapEl.value = a.province;

    const setProvince = (p: string | null) => {
      // شهر فقط وقتی می‌ماند که در استان تازه هم باشد (شهرهای خارج از فهرست هم پاک می‌شوند)
      const keep = p && this.address.city && getCities(p).includes(this.address.city);
      this.address = { ...this.address, province: p, city: keep ? this.address.city : null };
      if (province.value !== (p ?? "")) province.value = p ?? "";
      city.province = p;
      if (!keep) city.value = "";
      if (mapEl) mapEl.value = p ?? "";
      this.changed();
    };
    const stop = (e: Event) => e.stopPropagation();
    province.addEventListener("kashi-change", (e) => {
      stop(e);
      setProvince((e as CustomEvent).detail.value || null);
    });
    mapEl?.addEventListener("kashi-change", (e) => {
      stop(e);
      setProvince((e as CustomEvent).detail.value);
    });
    city.addEventListener("kashi-change", (e) => {
      stop(e);
      const { value, province: p } = (e as CustomEvent).detail;
      this.address = { ...this.address, city: value || null };
      if (p && !this.address.province) setProvince(p);
      else this.changed();
    });
    postal.addEventListener("kashi-change", (e) => {
      stop(e);
      this.address = { ...this.address, postalCode: (e as CustomEvent).detail.value };
      this.changed();
    });
    for (const [el, f] of [[street, "street"], [plaque, "plaque"], [unit, "unit"]] as const) {
      el.addEventListener("input", () => {
        this.address = { ...this.address, [f]: el.value };
        this.changed();
      });
    }
  }

  private changed() {
    emit(this, "kashi-change", { value: this.value });
  }

  private fieldError(field: HTMLElement, error: string | null) {
    field.querySelector(".k-field__hint-row")?.remove();
    const control = field.querySelector<HTMLElement>(".k-input__control")!;
    field.toggleAttribute("data-invalid", !!error);
    if (error) {
      field.insertAdjacentHTML("beforeend", `<div class="k-field__hint-row"><div class="k-field__hints"><p class="k-hint k-hint--error" id="${control.id}-error">${esc(error)}</p></div></div>`);
      control.setAttribute("aria-invalid", "true");
      control.setAttribute("aria-describedby", `${control.id}-error`);
    } else {
      control.removeAttribute("aria-invalid");
      control.removeAttribute("aria-describedby");
    }
  }
}

define("kashi-iran-map", KashiIranMap, "block");
define("kashi-address-form", KashiAddressForm, "block");
