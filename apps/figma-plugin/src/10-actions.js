// دکمه‌ها و کنترل‌های عملیاتی

const BTN_VARIANTS = {
  Primary: { bg: "bg-brand", hover: "bg-brand-hover", fg: "text-on-brand", shadow: true },
  Secondary: { bg: "bg-elevated", overlay: true, fg: "text-secondary", hoverFg: "text-primary", border: "border-primary", shadow: true },
  Tertiary: { overlay: true, fg: "text-secondary", hoverFg: "text-primary", ghost: true },
  Link: { fg: "text-brand", link: true },
  Danger: { bg: "bg-error", hover: "bg-error-hover", fg: "text-on-error", shadow: true, danger: true },
  "Danger secondary": { bg: "bg-elevated", overlay: true, fg: "text-error", border: "border-primary", shadow: true, danger: true },
};
const BTN_FONT = { xs: "Text xs/Semibold", sm: "Text sm/Semibold", md: "Text sm/Semibold", lg: "Text md/Semibold", xl: "Text md/Semibold" };
const BTN_ICON = { xs: 16, sm: 18, md: 20, lg: 20, xl: 20 };

/** دکمهٔ کاشی؛ در بقیهٔ کامپوننت‌ها هم استفاده می‌شود */
function button({ variant = "Secondary", size = "md", state = "Default", label = "ثبت", iconStart, iconEnd, iconOnly, pill, w } = {}) {
  const v = BTN_VARIANTS[variant];
  const disabled = state === "Disabled";
  const hover = state === "Hover";
  const focus = state === "Focus";
  let fg = v.fg;
  const fills = [];
  if (disabled && !v.link) {
    fg = "text-quaternary";
    if (!v.ghost) fills.push("bg-secondary");
  } else {
    if (hover && v.hover) fills.push(v.hover);
    else if (v.bg) fills.push(v.bg);
    if (hover && v.overlay) fills.push("bg-hover");
    if (hover && v.hoverFg) fg = v.hoverFg;
  }
  if (disabled && v.link) fg = "text-quaternary";
  const iconSize = BTN_ICON[size];
  const kids = [];
  if (iconOnly) kids.push(I(iconOnly, iconSize, fg));
  else {
    const s = I(iconStart || "plus", iconSize, fg); s.name = "Icon start"; s.visible = !!iconStart; kids.push(s);
    kids.push(T(label, { style: BTN_FONT[size], color: fg, name: "Label", decoration: v.link && hover ? "UNDERLINE" : undefined }));
    const e = I(iconEnd || "arrow-left", iconSize, fg); e.name = "Icon end"; e.visible = !!iconEnd; kids.push(e);
  }
  let shadow;
  if (!disabled && v.shadow) shadow = focus ? (v.danger ? "Button danger focus" : "Button focus") : "Button";
  else if (focus && !v.shadow) shadow = v.danger ? "Focus ring/error" : "Focus ring/brand";
  else if (disabled && v.shadow) shadow = "Shadow/xs";
  const f = F({
    name: "Button",
    dir: "H",
    gap: size === "xs" ? "space/1" : "space/1.5",
    // دکمهٔ گرد ۴ پیکسل فاصلهٔ بیشتر دارد (k-btn--pill)
    px: v.link ? 0 : iconOnly ? 0 : pill ? numOf(`control/padding/${size}`) + 4 : `control/padding/${size}`,
    h: v.link ? undefined : `control/height/${size}`,
    w: iconOnly ? `control/height/${size}` : w,
    align: "center",
    cross: "center",
    radius: pill ? "radius/full" : "radius/md",
    stroke: v.border ? (disabled ? "border-secondary" : v.border) : undefined,
    shadow,
  }, kids);
  f.fills = fills.map((c) => paint(c));
  // فقط حالت پیش‌فرض با CSS اندازه‌گیری‌شده مقایسه می‌شود
  if (state === "Default" && !w) {
    const cls = ["k-btn", `k-btn--${variant.toLowerCase().replace(" ", "-")}`, size !== "md" && `k-btn--${size}`, iconOnly && "k-btn--icon", pill && "k-btn--pill"].filter(Boolean).sort().join(" ");
    tagCss(f, { css: cls, cssCheck: iconOnly ? ["radius", "bg", "border", "h", "w"] : v.link ? ["bg"] : ["padx", "radius", "gap", "bg", "border", "h"] });
  }
  return f;
}

function buildActions() {
  const root = kitPage("🔘", "Actions", "دکمه‌ها و عملیات", "دکمه با سایهٔ اسکئومورفیک و حلقهٔ فوکوس نرم به سبک Untitled UI. ارتفاع و فاصلهٔ داخلی به مجموعهٔ Kashi · Density وصل است.");

  safe("Button", () => section(root, "Button · دکمه", "شش گونه، پنج اندازه و چهار حالت. متن، آیکون ابتدا و انتها از پنل ویژگی‌ها قابل تغییر است.", (h) => {
    componentSet(h, "Button", {
      axes: { Variant: Object.keys(BTN_VARIANTS), Size: ["xs", "sm", "md", "lg", "xl"], State: ["Default", "Hover", "Focus", "Disabled"] },
      build: (p) => button({ variant: p.Variant, size: p.Size, state: p.State }),
      text: { Label: ["Label", "ثبت"] },
      bools: { "Icon start": ["Icon start", false], "Icon end": ["Icon end", false] },
      cols: 20,
      gap: 16,
      description: "دکمهٔ کاشی — <Button variant size>. در React: import { Button } from \"@kashi-ui/react\"",
      docs: "button",
    });
  }));

  safe("IconButton", () => section(root, "Icon button · دکمهٔ آیکونی", "دکمهٔ مربعی فقط با آیکون. حتماً در کد aria-label بدهید.", (h) => {
    componentSet(h, "Icon button", {
      axes: { Variant: ["Primary", "Secondary", "Tertiary"], Size: ["sm", "md", "lg"], State: ["Default", "Hover", "Disabled"], Shape: ["Square", "Pill"] },
      build: (p) => button({ variant: p.Variant, size: p.Size, state: p.State, iconOnly: "plus", pill: p.Shape === "Pill" }),
      cols: 18,
      gap: 16,
      docs: "button",
    });
  }));

  safe("ButtonGroup", () => section(root, "Button group · گروه دکمه", "چند دکمهٔ چسبیده برای انتخاب یا عملیات مرتبط.", (h) => {
    componentSet(h, "Button group", {
      axes: { Size: ["sm", "md"] },
      build: (p) => {
        const items = ["روز", "هفته", "ماه", "سال"];
        const f = F({ name: "Button group", dir: "H", gap: 0, radius: "radius/md", stroke: "border-primary", clip: true, shadow: "Shadow/xs", fill: "bg-elevated" },
          items.map((label, i) =>
            F({ name: "Item", dir: "H", h: `control/height/${p.Size}`, px: `control/padding/${p.Size}`, cross: "center", fill: i === 1 ? "bg-active" : undefined, stroke: i < items.length - 1 ? "border-primary" : undefined, sides: [0, 0, 0, 1] }, [
              T(label, { style: "Text sm/Semibold", color: i === 1 ? "text-primary" : "text-secondary" }),
            ]),
          ));
        return f;
      },
      docs: "button-group",
    });
  }));

  safe("Segmented", () => section(root, "Segmented control · کنترل بخش‌بندی", "انتخاب یکی از چند گزینه؛ مثل تب کوچک.", (h) => {
    componentSet(h, "Segmented control", {
      axes: { Size: ["sm", "md"], Selected: ["1", "2", "3"] },
      build: (p) => {
        const items = ["فهرست", "جدول", "نقشه"];
        // k-segmented: فاصلهٔ ۳، گوشهٔ ۱۲؛ هر بخش ۳۲ (کوچک ۲۸) با گوشهٔ ۹
        return F({ name: "Segmented", dir: "H", gap: 2, p: 3, radius: 12, fill: "bg-secondary", stroke: "border-secondary", css: p.Size === "sm" ? "k-segmented k-segmented--sm" : "k-segmented" },
          items.map((label, i) => {
            const on = String(i + 1) === p.Selected;
            return F({ name: "Segment", dir: "H", gap: "space/1.5", h: p.Size === "sm" ? 28 : 32, px: "space/3", cross: "center", radius: 9, fill: on ? "bg-elevated" : undefined, shadow: on ? "Shadow/sm" : undefined, css: on ? undefined : "k-segmented__item", cssCheck: ["padx", "radius", "gap", "bg"] }, [
              T(label, { style: "Text sm/Semibold", color: on ? "text-primary" : "text-tertiary", css: on ? undefined : "k-segmented__item" }),
            ]);
          }));
      },
      docs: "segmented-control",
    });
  }));

  safe("Copy", () => section(root, "Copy button · دکمهٔ کپی", "کپی در کلیپ‌بورد با بازخورد «کپی شد».", (h) => {
    componentSet(h, "Copy button", {
      axes: { State: ["Idle", "Copied"] },
      build: (p) => {
        const f = button({ variant: "Secondary", size: "sm", label: p.State === "Idle" ? "کپی" : "کپی شد", iconStart: p.State === "Idle" ? "copy" : "check" });
        if (p.State === "Copied") for (const n of f.findAll((x) => x.type === "TEXT")) n.fills = [paint("text-success")];
        return f;
      },
      docs: "copy-button",
    });
  }));
}
