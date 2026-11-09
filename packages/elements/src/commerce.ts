// نسخهٔ ۲: کامپوننت‌های فروشگاهی — جستجو با پیشنهاد، بازهٔ قیمت و نمونهٔ رنگ؛ همان کلاس‌ها و رفتار نسخهٔ React
import { formatNumber, toEnDigits } from "@kashi-ui/persian";
import { define, digitsOf, emit, esc, HTMLBase, lang, msg, uid } from "./base.js";

const norm = (s: string) => s.replace(/[يى]/g, "ی").replace(/ك/g, "ک").replace(/[‌\s]+/g, " ").trim().toLowerCase();
const list = (v: string | null) => (v ?? "").split(/[,،]/).map((s) => s.trim()).filter(Boolean);
const SEARCH = '<svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="9.1" cy="9.1" r="6.2"/><path d="m14 14 3.3 3.3"/></svg>';
const TREND = '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2.75 13.5 4.6-4.6 3.2 3.2 6.2-6.2M12.75 5.9h4v4"/></svg>';
const HISTORY = '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.3 10a6.7 6.7 0 1 0 1.9-4.7M3.2 2.9v2.6h2.6M10 6.6V10l2.3 1.5"/></svg>';
const CHECK = '<svg class="k-swatch__check" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 10.5 3.2 3L15 7"/></svg>';

/**
 * <kashi-price-range label="قیمت" min="0" max="25000000" step="100000" value="1500000,18000000" name="price">
 * رویداد kashi-change با { value: [از، تا] }
 */
export class KashiPriceRange extends HTMLBase {
  static observedAttributes = ["label", "min", "max", "step", "value", "unit", "name", "disabled"];
  private lo = 0;
  private hi = 0;
  private ready = false;
  private key = uid("kashi-price");

  connectedCallback() {
    if (!this.ready) this.read(this.getAttribute("value"));
    this.render();
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.ready || old === next) return;
    if (name === "value") this.read(next);
    this.render();
  }
  private n(a: string, d: number) {
    const v = this.getAttribute(a);
    return v === null || v === "" || Number.isNaN(Number(v)) ? d : Number(v);
  }
  private get min() { return this.n("min", 0); }
  private get max() { return this.n("max", 100_000_000); }
  private get step() { return this.n("step", 1000); }
  private read(v: string | null) {
    const p = list(v).map(Number);
    [this.lo, this.hi] = [p[0] ?? this.min, p[1] ?? this.max];
  }
  get value(): [number, number] { return [this.lo, this.hi]; }
  set value(v: [number, number]) { [this.lo, this.hi] = v; if (this.ready) this.render(); }

  private fmt(n: number) { return formatNumber(n, { digits: digitsOf(this) }); }

  private render() {
    const M = msg().priceRange;
    const label = this.getAttribute("label");
    const unit = this.getAttribute("unit") ?? (lang() === "en" ? "Toman" : "تومان");
    const name = this.getAttribute("name");
    const off = this.hasAttribute("disabled") ? " disabled" : "";
    const pct = (n: number) => `${((n - this.min) / (this.max - this.min)) * 100}%`;
    const field = (i: 0 | 1) => `<label class="k-price-range__field"><span class="k-price-range__edge">${esc(i ? M.to : M.from)}</span><input class="k-price-range__input" data-i="${i}" inputmode="numeric" dir="ltr" autocomplete="off" value="${esc(this.fmt(i ? this.hi : this.lo))}" aria-label="${esc(`${i ? M.to : M.from}${label ? ` ${label}` : ""}`)}"${off}><span class="k-price-range__unit">${esc(unit)}</span></label>`;
    const range = (w: "lo" | "hi") => `<input type="range" class="k-slider__input" data-w="${w}" min="${this.min}" max="${this.max}" step="${this.step}" value="${w === "lo" ? this.lo : this.hi}"${name ? ` name="${esc(`${name}_${w === "lo" ? "min" : "max"}`)}"` : ""} aria-label="${esc(`${w === "lo" ? M.from : M.to}${label ? ` ${label}` : ""}`)}" aria-valuetext="${esc(`${this.fmt(w === "lo" ? this.lo : this.hi)} ${unit}`)}"${off}>`;
    this.innerHTML = `<div class="k-price-range" role="group" ${label ? `aria-labelledby="${this.key}"` : `aria-label="${esc(M.range)}"`}>${label ? `<span class="k-label k-price-range__label" id="${this.key}">${esc(label)}</span>` : ""}<div class="k-price-range__fields">${field(0)}${field(1)}</div><div class="k-slider k-price-range__slider" data-range=""><div class="k-slider__track" style="--_from: ${pct(this.lo)}; --_to: ${pct(this.hi)}"><span class="k-slider__fill" aria-hidden="true"></span>${range("lo")}${range("hi")}</div></div><div class="k-price-range__ends" aria-hidden="true"><span>${esc(M.min)}</span><span>${esc(M.max)}</span></div></div>`;
    this.ready = true;

    const sync = () => {
      const t = this.querySelector<HTMLElement>(".k-slider__track")!;
      t.style.setProperty("--_from", pct(this.lo));
      t.style.setProperty("--_to", pct(this.hi));
      this.querySelectorAll<HTMLInputElement>(".k-slider__input").forEach((r) => {
        r.value = String(r.dataset.w === "lo" ? this.lo : this.hi);
        r.setAttribute("aria-valuetext", `${this.fmt(Number(r.value))} ${unit}`);
      });
      this.querySelectorAll<HTMLInputElement>(".k-price-range__input").forEach((f) => { if (document.activeElement !== f) f.value = this.fmt(f.dataset.i === "1" ? this.hi : this.lo); });
      emit(this, "kashi-change", { value: this.value });
    };
    this.querySelectorAll<HTMLInputElement>(".k-slider__input").forEach((r) => r.addEventListener("input", () => {
      const n = Number(r.value);
      if (r.dataset.w === "lo") this.lo = Math.min(n, this.hi); else this.hi = Math.max(n, this.lo);
      sync();
    }));
    this.querySelectorAll<HTMLInputElement>(".k-price-range__input").forEach((f) => {
      f.addEventListener("input", () => {
        const d = toEnDigits(f.value).replace(/\D/g, "");
        f.value = d ? this.fmt(Number(d)) : "";
      });
      const commit = () => {
        let n = Math.round(Number(toEnDigits(f.value).replace(/\D/g, "") || 0) / this.step) * this.step;
        n = Math.min(this.max, Math.max(this.min, n));
        if (f.dataset.i === "1") this.hi = Math.max(n, this.lo); else this.lo = Math.min(n, this.hi);
        f.value = this.fmt(f.dataset.i === "1" ? this.hi : this.lo);
        sync();
      };
      f.addEventListener("blur", commit);
      f.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } });
    });
  }
}

/**
 * <kashi-swatch-group label="رنگ" name="color" value="blue">
 *   <option value="blue" data-color="#3b6fd4">آبی</option> …
 * </kashi-swatch-group>
 * ویژگی single برای یک انتخاب؛ رویداد kashi-change با { value: string[] }
 */
export class KashiSwatchGroup extends HTMLBase {
  static observedAttributes = ["label", "value", "single", "size", "name"];
  private opts: { value: string; label: string; color: string; disabled: boolean }[] = [];
  private sel: string[] = [];
  private ready = false;
  private key = uid("kashi-swatch");

  connectedCallback() {
    if (!this.ready) {
      this.opts = [...this.querySelectorAll("option")].map((o) => ({ value: o.value, label: o.textContent?.trim() ?? o.value, color: o.dataset.color ?? o.value, disabled: o.disabled }));
      this.sel = list(this.getAttribute("value"));
    }
    this.render();
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.ready || old === next) return;
    if (name === "value") this.sel = list(next);
    this.render();
  }
  get value() { return [...this.sel]; }
  set value(v: string[]) { this.sel = [...v]; if (this.ready) this.render(); }

  private render() {
    const single = this.hasAttribute("single");
    const size = this.getAttribute("size");
    const label = this.getAttribute("label");
    const name = this.getAttribute("name") ?? (single ? this.key : "");
    this.innerHTML = `<fieldset class="k-swatches${size === "sm" || size === "lg" ? ` k-swatches--${size}` : ""}">${label ? `<legend class="k-label k-swatches__legend">${esc(label)}</legend>` : ""}<div class="k-swatches__grid"${single ? ' role="radiogroup"' : ""}>${this.opts.map((o) => {
      const on = this.sel.includes(o.value);
      return `<label class="k-swatch"${o.disabled ? " data-disabled" : ""}><input type="${single ? "radio" : "checkbox"}" class="k-sr-only"${name ? ` name="${esc(name)}"` : ""} value="${esc(o.value)}"${on ? " checked" : ""}${o.disabled ? " disabled" : ""}><span class="k-swatch__color" style="--_c: ${esc(o.color)}" aria-hidden="true">${CHECK}</span><span class="k-swatch__label">${esc(o.label)}${on ? `<span class="k-sr-only">، ${esc(msg().swatch.selected)}</span>` : ""}</span></label>`;
    }).join("")}</div></fieldset>`;
    this.ready = true;
    this.querySelectorAll<HTMLInputElement>("input").forEach((i) => {
      i.addEventListener("click", (e) => {
        if (single && this.sel[0] === i.value) { e.preventDefault(); this.sel = []; }
        else this.sel = single ? [i.value] : this.sel.includes(i.value) ? this.sel.filter((x) => x !== i.value) : [...this.sel, i.value];
        this.render();
        this.querySelector<HTMLInputElement>(`input[value="${CSS.escape(i.value)}"]`)?.focus();
        emit(this, "kashi-change", { value: this.value });
      });
    });
  }
}

/**
 * <kashi-search-suggest placeholder="جستجو در همهٔ کالاها" popular="ساعت هوشمند، عروسک" suggestions="…" storage-key="shop-recent" action="/search">
 * رویدادها: kashi-search با { query }، kashi-change با { value }. با action، فرم به آن نشانی (با q) ارسال می‌شود.
 */
export class KashiSearchSuggest extends HTMLBase {
  static observedAttributes = ["placeholder", "popular", "suggestions", "recent", "storage-key", "label", "name", "action"];
  private q = "";
  private open = false;
  private active = -1;
  private ready = false;
  private key = uid("kashi-search");

  connectedCallback() {
    if (!this.ready) this.render();
    document.addEventListener("pointerdown", this.outside);
  }
  disconnectedCallback() { document.removeEventListener("pointerdown", this.outside); }
  attributeChangedCallback() { if (this.ready) this.paint(); }
  private outside = (e: PointerEvent) => { if (!this.contains(e.target as Node)) this.setOpen(false); };

  get value() { return this.q; }
  set value(v: string) { this.q = v; const i = this.querySelector<HTMLInputElement>("input"); if (i) i.value = v; this.paint(); }

  private get recent(): string[] {
    const k = this.getAttribute("storage-key");
    if (k) { try { return JSON.parse(localStorage.getItem(k) ?? "[]"); } catch { return []; } }
    return list(this.getAttribute("recent"));
  }
  private set recent(v: string[]) {
    const k = this.getAttribute("storage-key");
    if (k) { try { localStorage.setItem(k, JSON.stringify(v.slice(0, 8))); } catch { /* حالت خصوصی */ } }
    else this.setAttribute("recent", v.join("،"));
  }
  private get hits() {
    const n = norm(this.q);
    return n ? list(this.getAttribute("suggestions")).filter((s) => norm(s).includes(n)).slice(0, 8) : [];
  }

  private render() {
    const M = msg().searchSuggest;
    const name = this.getAttribute("name") ?? "q";
    const action = this.getAttribute("action");
    this.innerHTML = `<form class="k-search-suggest" role="search"${action ? ` action="${esc(action)}"` : ""}><div class="k-search-suggest__box">${SEARCH}<input type="search" class="k-search-suggest__input" name="${esc(name)}" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${this.key}" autocomplete="off" enterkeyhint="search" aria-label="${esc(this.getAttribute("label") ?? M.label)}" placeholder="${esc(this.getAttribute("placeholder") ?? "")}"></div><div class="k-search-suggest__panel" id="${this.key}" hidden></div></form>`;
    this.ready = true;
    const input = this.querySelector<HTMLInputElement>("input")!;
    const form = this.querySelector("form")!;
    input.addEventListener("focus", () => this.setOpen(true));
    input.addEventListener("input", () => { this.q = input.value; this.active = -1; this.setOpen(true); emit(this, "kashi-change", { value: this.q }); });
    input.addEventListener("keydown", (e) => {
      const m = this.hits;
      if (e.key === "Escape") { if (this.open) { e.preventDefault(); this.setOpen(false); } else { input.value = this.q = ""; } return; }
      if (!m.length) return;
      if (e.key === "ArrowDown") { e.preventDefault(); this.active = (this.active + 1) % m.length; this.setOpen(true); }
      if (e.key === "ArrowUp") { e.preventDefault(); this.active = this.active <= 0 ? m.length - 1 : this.active - 1; this.paint(); }
    });
    form.addEventListener("submit", (e) => {
      const m = this.hits;
      const q = (this.active >= 0 && m[this.active]) || input.value;
      if (!action) e.preventDefault();
      this.search(q, !action);
    });
    this.paint();
  }

  private search(q: string, prevent = true) {
    const t = q.trim();
    if (!t) return;
    const input = this.querySelector<HTMLInputElement>("input")!;
    input.value = this.q = t;
    this.recent = [t, ...this.recent.filter((x) => norm(x) !== norm(t))];
    this.setOpen(false);
    emit(this, "kashi-search", { query: t });
    if (!prevent && this.getAttribute("action")) this.querySelector("form")!.requestSubmit?.();
  }

  private setOpen(v: boolean) { this.open = v; this.paint(); }

  private paint() {
    const panel = this.querySelector<HTMLElement>(".k-search-suggest__panel");
    const input = this.querySelector<HTMLInputElement>("input");
    if (!panel || !input) return;
    const M = msg().searchSuggest;
    const m = this.hits;
    const recent = this.recent;
    const popular = list(this.getAttribute("popular"));
    const idle = !this.q.trim() && (recent.length > 0 || popular.length > 0);
    const visible = this.open && (m.length > 0 || idle);
    panel.hidden = !visible;
    input.setAttribute("aria-expanded", String(visible));
    input.toggleAttribute("aria-activedescendant", false);
    if (!visible) return;
    const chip = (s: string, icon: string) => `<li><button type="button" class="k-search-suggest__chip" data-q="${esc(s)}">${icon}${esc(s)}</button></li>`;
    if (m.length) {
      panel.innerHTML = `<ul role="listbox" aria-label="${esc(M.suggestions)}" class="k-search-suggest__list">${m.map((s, i) => `<li id="${this.key}-${i}" role="option" aria-selected="${i === this.active}" class="k-option" data-q="${esc(s)}"${i === this.active ? " data-active" : ""}>${SEARCH}<span class="k-option__label">${esc(s)}</span></li>`).join("")}</ul>`;
      if (this.active >= 0) input.setAttribute("aria-activedescendant", `${this.key}-${this.active}`);
    } else {
      panel.innerHTML = `${recent.length ? `<section class="k-search-suggest__section"><div class="k-search-suggest__head"><b>${esc(M.recent)}</b><button type="button" class="k-btn k-btn--link k-btn--sm" data-clear>${esc(M.clear)}</button></div><ul class="k-search-suggest__chips">${recent.map((s) => chip(s, HISTORY)).join("")}</ul></section>` : ""}${popular.length ? `<section class="k-search-suggest__section"><div class="k-search-suggest__head"><b>${esc(M.popular)}</b></div><ul class="k-search-suggest__chips">${popular.map((s) => chip(s, TREND)).join("")}</ul></section>` : ""}`;
    }
    panel.querySelectorAll<HTMLElement>("[data-q]").forEach((el) => {
      el.addEventListener("mousedown", (e) => e.preventDefault());
      el.addEventListener("click", () => this.search(el.dataset.q!, !this.getAttribute("action")));
    });
    panel.querySelector("[data-clear]")?.addEventListener("click", () => { this.recent = []; this.paint(); });
  }
}

define("kashi-price-range", KashiPriceRange, "block");
define("kashi-swatch-group", KashiSwatchGroup, "block");
define("kashi-search-suggest", KashiSearchSuggest, "block");
