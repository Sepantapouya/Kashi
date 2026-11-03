import { HTMLBase, ICONS, afterParse, bool, define, emit, esc, uid } from "./base.js";

/**
 * پنجرهٔ گفتگو روی <dialog> بومی با showModal: فوکوس داخل پنجره می‌ماند، Esc می‌بندد،
 * بقیهٔ صفحه از دسترس صفحه‌خوان خارج می‌شود و پس از بستن، فوکوس به دکمهٔ بازکننده برمی‌گردد.
 * محتوای عنصر بدنهٔ پنجره است و عنصرهای slot="footer" در پایین پنجره می‌آیند.
 */
export class KashiDialog extends HTMLBase {
  static observedAttributes = ["open", "heading", "description", "tone", "size", "placement", "close-label"];
  private dialog: HTMLDialogElement | null = null;
  private opener: Element | null = null;
  private key = uid("kashi-dialog");

  connectedCallback() {
    afterParse(() => {
      if (!this.isConnected) return;
      if (!this.dialog) this.build();
      this.sync();
    });
  }

  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.dialog || old === next) return;
    if (name === "open") this.sync();
    else this.decorate();
  }

  get open() {
    return this.hasAttribute("open");
  }
  set open(v: boolean) {
    this.toggleAttribute("open", !!v);
  }
  /** باز کردن پنجره */
  show() {
    this.open = true;
  }
  /** بستن پنجره؛ returnValue در رویداد kashi-close می‌آید */
  close(returnValue?: string) {
    if (this.dialog?.open) this.dialog.close(returnValue);
    else this.open = false;
  }

  private build() {
    const footer = [...this.children].filter((c) => c.getAttribute("slot") === "footer");
    const body = [...this.childNodes].filter((n) => !footer.includes(n as Element));
    const d = document.createElement("dialog");
    d.setAttribute("aria-labelledby", `${this.key}-title`);
    d.innerHTML = `<div class="k-dialog__header"><div class="k-dialog__heading"><h2 class="k-dialog__title" id="${this.key}-title"></h2><p class="k-dialog__description" id="${this.key}-desc"></p></div><button type="button" class="k-btn k-btn--tertiary k-btn--icon k-btn--sm k-dialog__close">${ICONS.close}</button></div>`;
    const hasBody = body.some((n) => n.nodeType === 1 || n.textContent?.trim());
    if (hasBody) {
      const b = document.createElement("div");
      b.className = "k-dialog__body";
      b.append(...body);
      d.append(b);
    }
    if (footer.length) {
      const f = document.createElement("div");
      f.className = "k-dialog__footer";
      for (const el of footer) {
        el.removeAttribute("slot");
        f.append(el);
      }
      d.append(f);
    }
    this.replaceChildren(d);
    this.dialog = d;
    d.querySelector(".k-dialog__close")!.addEventListener("click", () => this.close());
    d.addEventListener("click", (e) => {
      // کلیک روی خود <dialog> یعنی کلیک روی پس‌زمینه
      if (e.target === d && bool(this, "dismissible", true)) this.close();
      const closer = (e.target as Element).closest("[data-kashi-close]");
      if (closer && d.contains(closer)) this.close(closer.getAttribute("data-kashi-close") || undefined);
    });
    d.addEventListener("close", () => {
      this.removeAttribute("open");
      (this.opener as HTMLElement | null)?.focus?.();
      emit(this, "kashi-close", { returnValue: d.returnValue });
    });
    this.decorate();
  }

  private decorate() {
    const d = this.dialog!;
    const size = this.getAttribute("size") ?? "md";
    const placement = this.getAttribute("placement") ?? "center";
    d.className = ["k-dialog", size !== "md" && `k-dialog--${size}`, placement !== "center" && `k-dialog--${placement}`, this.getAttribute("tone") === "danger" && "k-dialog--danger"].filter(Boolean).join(" ");
    d.dataset.placement = placement;
    d.querySelector(".k-dialog__title")!.textContent = this.getAttribute("heading") ?? "";
    const desc = d.querySelector<HTMLElement>(".k-dialog__description")!;
    const description = this.getAttribute("description");
    desc.textContent = description ?? "";
    desc.hidden = !description;
    if (description) d.setAttribute("aria-describedby", desc.id);
    else d.removeAttribute("aria-describedby");
    d.querySelector(".k-dialog__close")!.setAttribute("aria-label", this.getAttribute("close-label") ?? "بستن");
  }

  private sync() {
    const d = this.dialog;
    if (!d || !this.isConnected) return;
    if (this.open && !d.open) {
      this.opener = document.activeElement;
      d.showModal?.();
      emit(this, "kashi-open", {});
    } else if (!this.open && d.open) d.close();
  }
}

/**
 * زبانه‌ها از روی بخش‌های داخل عنصر ساخته می‌شوند: هر فرزند با data-tab یک زبانه است.
 * الگوی Tabs در WAI-ARIA؛ کلیدهای جهت‌دار در راست‌به‌چپ برعکس عمل می‌کنند. بدون JavaScript همهٔ بخش‌ها دیده می‌شوند.
 */
export class KashiTabs extends HTMLBase {
  static observedAttributes = ["value", "variant", "block", "orientation", "size", "label"];
  private list: HTMLElement | null = null;
  private key = uid("kashi-tabs");
  private ro: ResizeObserver | null = null;

  connectedCallback() {
    afterParse(() => this.isConnected && this.setup());
  }
  private setup() {
    if (!this.list) this.build();
    this.decorate();
    this.select(this.getAttribute("value") ?? this.panels[0]?.dataset.value ?? "", false);
    if (typeof ResizeObserver !== "undefined" && !this.ro) {
      this.ro = new ResizeObserver(() => this.measure());
      this.ro.observe(this.list!);
    }
  }
  disconnectedCallback() {
    this.ro?.disconnect();
    this.ro = null;
  }
  attributeChangedCallback(name: string, old: string | null, next: string | null) {
    if (!this.list || old === next) return;
    if (name === "value") this.select(next ?? "", false);
    else this.decorate();
  }

  /** مقدار زبانهٔ فعال */
  get value() {
    return this.getAttribute("value") ?? "";
  }
  set value(v: string) {
    this.setAttribute("value", v);
  }

  private get panels() {
    return [...this.children].filter((c): c is HTMLElement => c instanceof HTMLElement && c.hasAttribute("data-tab"));
  }

  private build() {
    const list = document.createElement("div");
    list.setAttribute("role", "tablist");
    list.className = "k-tabs__list";
    this.panels.forEach((p, i) => {
      const value = p.dataset.value || String(i + 1);
      p.dataset.value = value;
      const tab = document.createElement("button");
      tab.type = "button";
      tab.setAttribute("role", "tab");
      tab.className = "k-tabs__tab";
      tab.id = `${this.key}-tab-${i}`;
      tab.dataset.value = value;
      tab.textContent = p.dataset.tab ?? "";
      if (p.hasAttribute("data-disabled")) tab.disabled = true;
      p.id ||= `${this.key}-panel-${i}`;
      tab.setAttribute("aria-controls", p.id);
      p.setAttribute("role", "tabpanel");
      p.setAttribute("aria-labelledby", tab.id);
      p.tabIndex = 0;
      p.classList.add("k-tabs__panel");
      list.append(tab);
    });
    const indicator = document.createElement("span");
    indicator.className = "k-tabs__indicator";
    indicator.setAttribute("aria-hidden", "true");
    list.append(indicator);
    list.addEventListener("click", (e) => {
      const tab = (e.target as Element).closest<HTMLButtonElement>('[role="tab"]');
      if (tab && !tab.disabled) this.select(tab.dataset.value!, true);
    });
    list.addEventListener("keydown", (e) => this.onKey(e));
    this.prepend(list);
    this.list = list;
  }

  private decorate() {
    const variant = this.getAttribute("variant") ?? "line";
    const vertical = this.getAttribute("orientation") === "vertical";
    for (const c of [...this.classList]) if (c.startsWith("k-tabs")) this.classList.remove(c);
    this.classList.add("k-tabs", `k-tabs--${variant}`);
    if (bool(this, "block")) this.classList.add("k-tabs--block");
    if (vertical) this.classList.add("k-tabs--vertical");
    if (this.getAttribute("size") === "sm") this.classList.add("k-tabs--sm");
    this.dataset.orientation = vertical ? "vertical" : "horizontal";
    this.list!.setAttribute("aria-orientation", vertical ? "vertical" : "horizontal");
    const label = this.getAttribute("label");
    if (label) this.list!.setAttribute("aria-label", label);
    this.measure();
  }

  private select(value: string, user: boolean) {
    const tabs = [...this.list!.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    if (!tabs.some((t) => t.dataset.value === value)) value = tabs[0]?.dataset.value ?? "";
    for (const t of tabs) {
      const on = t.dataset.value === value;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    }
    for (const p of this.panels) p.hidden = p.dataset.value !== value;
    if (this.getAttribute("value") !== value) {
      // تغییر ویژگی دوباره select را صدا می‌زند؛ همان مقدار است و کاری نمی‌کند
      this.setAttribute("value", value);
    }
    this.measure();
    if (user) emit(this, "kashi-change", { value });
  }

  /** نشانگر زبانهٔ فعال که با تغییر زبانه می‌لغزد */
  private measure() {
    const list = this.list;
    const tab = list?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (!list || !tab || !tab.offsetWidth) {
      list?.removeAttribute("data-indicator");
      return;
    }
    list.setAttribute("data-indicator", "");
    list.style.setProperty("--_ix", `${tab.offsetLeft}px`);
    list.style.setProperty("--_iy", `${tab.offsetTop}px`);
    list.style.setProperty("--_iw", `${tab.offsetWidth}px`);
    list.style.setProperty("--_ih", `${tab.offsetHeight}px`);
  }

  private onKey(e: KeyboardEvent) {
    const tabs = [...this.list!.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)')];
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const rtl = getComputedStyle(this.list!).direction === "rtl";
    const moves: Record<string, number> =
      this.getAttribute("orientation") === "vertical"
        ? { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 }
        : { ArrowLeft: rtl ? i + 1 : i - 1, ArrowRight: rtl ? i - 1 : i + 1, Home: 0, End: tabs.length - 1 };
    if (!(e.key in moves)) return;
    e.preventDefault();
    const next = tabs[(moves[e.key] + tabs.length) % tabs.length];
    next.focus();
    this.select(next.dataset.value!, true);
  }
}

/**
 * راهنمای کوتاه طبق WCAG 1.4.13: با hover و فوکوس نمایش داده می‌شود، روی خودش هم hover پذیر است
 * و با Esc بسته می‌شود. با aria-describedby به اولین فرزند (معمولاً یک دکمه) متصل است.
 */
export class KashiTooltip extends HTMLBase {
  static observedAttributes = ["content", "placement"];
  private tip: HTMLElement | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private key = uid("kashi-tip");

  connectedCallback() {
    afterParse(() => this.isConnected && this.setup());
  }
  private setup() {
    if (!this.tip) {
      this.classList.add("k-tooltip-anchor");
      const tip = document.createElement("span");
      tip.setAttribute("role", "tooltip");
      tip.id = this.key;
      tip.hidden = true;
      this.append(tip);
      this.tip = tip;
      const trigger = this.firstElementChild !== tip ? this.firstElementChild : null;
      if (trigger) trigger.setAttribute("aria-describedby", [trigger.getAttribute("aria-describedby"), this.key].filter(Boolean).join(" "));
      this.addEventListener("mouseenter", () => this.show(Number(this.getAttribute("delay") ?? 300)));
      this.addEventListener("mouseleave", () => this.hide());
      this.addEventListener("focusin", () => this.show(0));
      this.addEventListener("focusout", () => this.hide());
    }
    this.decorate();
  }
  disconnectedCallback() {
    clearTimeout(this.timer);
    document.removeEventListener("keydown", this.onKey);
  }
  attributeChangedCallback() {
    if (this.tip) this.decorate();
  }

  private decorate() {
    const placement = this.getAttribute("placement");
    this.tip!.className = `k-tooltip${placement && placement !== "top" ? ` k-tooltip--${placement}` : ""}`;
    this.tip!.textContent = this.getAttribute("content") ?? "";
  }
  private show(wait: number) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.tip!.hidden = false;
      document.addEventListener("keydown", this.onKey);
    }, wait);
  }
  private hide() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.tip!.hidden = true;
      document.removeEventListener("keydown", this.onKey);
    }, 100);
  }
  private onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      clearTimeout(this.timer);
      this.tip!.hidden = true;
    }
  };
}

/** دکمهٔ کپی در کلیپ‌بورد با بازخورد «کپی شد» برای چشم و صفحه‌خوان */
export class KashiCopyButton extends HTMLBase {
  static observedAttributes = ["value", "target", "label", "copied-label", "icon-only", "variant", "size"];
  private state: "idle" | "copied" | "failed" = "idle";
  private timer: ReturnType<typeof setTimeout> | undefined;
  private built = false;

  connectedCallback() {
    if (!this.built) {
      this.built = true;
      this.addEventListener("click", (e) => {
        if ((e.target as Element).closest("button")) this.copy();
      });
    }
    this.render();
  }
  disconnectedCallback() {
    clearTimeout(this.timer);
  }
  attributeChangedCallback() {
    if (this.built) this.render();
  }

  /** متنی که کپی می‌شود: ویژگی value، یا مقدار/متن عنصری که target به آن اشاره می‌کند */
  get text(): string {
    const value = this.getAttribute("value");
    if (value !== null) return value;
    const target = this.getAttribute("target");
    const el = target ? document.querySelector<HTMLElement & { value?: string }>(target) : null;
    return el ? (typeof el.value === "string" ? el.value : (el.textContent ?? "").trim()) : "";
  }

  async copy() {
    try {
      await navigator.clipboard.writeText(this.text);
      this.state = "copied";
      emit(this, "kashi-copy", { value: this.text });
    } catch {
      this.state = "failed";
    }
    this.render();
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.state = "idle";
      this.render();
    }, Number(this.getAttribute("timeout")) || 2000);
  }

  private render() {
    const copy = this.getAttribute("label") ?? "کپی";
    const copied = this.getAttribute("copied-label") ?? "کپی شد";
    const text = this.state === "copied" ? copied : this.state === "failed" ? "کپی نشد" : copy;
    const iconOnly = bool(this, "icon-only");
    const icon = this.state === "copied" ? ICONS.check : ICONS.copy;
    const variant = this.getAttribute("variant") ?? "secondary";
    const size = this.getAttribute("size") ?? "sm";
    const focused = this.contains(document.activeElement);
    this.innerHTML = `<button type="button" class="k-btn k-btn--${esc(variant)}${size !== "md" ? ` k-btn--${esc(size)}` : ""}${iconOnly ? " k-btn--icon" : ""}" data-variant="${esc(variant)}" data-size="${esc(size)}"${iconOnly ? ` aria-label="${esc(text)}"` : ""}${this.state === "copied" ? ' data-copied=""' : ""}>${icon}${iconOnly ? "" : esc(text)}</button><span class="k-sr-only" aria-live="polite">${this.state === "idle" ? "" : esc(text)}</span>`;
    if (focused) this.querySelector("button")!.focus();
  }
}

define("kashi-dialog", KashiDialog, "contents");
define("kashi-tabs", KashiTabs, "block");
define("kashi-tooltip", KashiTooltip);
define("kashi-copy-button", KashiCopyButton);

// دکمه‌هایی که بدون JavaScript پنجره را باز یا می‌بندند: data-kashi-open="شناسهٔ پنجره"
if (typeof document !== "undefined") {
  document.addEventListener("click", (e) => {
    const opener = (e.target as Element | null)?.closest?.("[data-kashi-open]");
    if (opener) {
      const dialog = document.getElementById(opener.getAttribute("data-kashi-open")!) as KashiDialog | null;
      if (dialog?.show) {
        e.preventDefault();
        dialog.show();
      }
    }
  });
}
