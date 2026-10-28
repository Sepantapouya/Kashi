// نمایش داده: نشان، آواتار، کارت، آمار، جدول، خط زمان، درخت و نمودار

const BADGE_TONES = {
  Neutral: { fg: "text-secondary", bg: "bg-tertiary" },
  Brand: { fg: "text-brand", bg: "bg-brand-subtle" },
  Info: { fg: "text-info", bg: "bg-info-subtle" },
  Success: { fg: "text-success", bg: "bg-success-subtle" },
  Warning: { fg: "text-warning", bg: "bg-warning-subtle" },
  Error: { fg: "text-error", bg: "bg-error-subtle" },
};

function badge({ tone = "Neutral", variant = "Soft", size = "md", label = "فعال", dot = true } = {}) {
  const t = BADGE_TONES[tone];
  const solid = variant === "Solid";
  const outline = variant === "Outline";
  const fg = solid ? "bg-primary" : t.fg;
  return F({
    name: "Badge", dir: "H", gap: "space/1", px: { sm: 8, md: 10, lg: 12 }[size], h: { sm: 22, md: 24, lg: 28 }[size], cross: "center",
    radius: "radius/full", fill: solid ? t.fg : outline ? undefined : t.bg, stroke: solid ? undefined : t.fg, strokeOpacity: outline ? 0.45 : 0.2,
  }, [
    (() => { const d = R({ ellipse: true, w: 6, h: 6, fill: fg, name: "Dot" }); d.visible = dot; return d; })(),
    T(label, { style: size === "sm" ? "Text xs/Medium" : "Text sm/Medium", color: fg, name: "Label" }),
  ]);
}

const AVATAR_SIZES = { xs: 24, sm: 32, md: 40, lg: 48, xl: 56, "2xl": 64 };
function avatar({ size = "md", type = "Initials", tone = "Brand", status, initials = "سپ" } = {}) {
  const s = AVATAR_SIZES[size];
  const t = BADGE_TONES[tone] || BADGE_TONES.Brand;
  const kids = [];
  if (type === "Initials") kids.push(T(initials, { style: "Text sm/Semibold", color: t.fg, align: "center", size: Math.round(s * 0.36), weight: "semibold", leading: 1.2 }));
  else if (type === "Icon") kids.push(I("user", Math.round(s * 0.5), "text-tertiary"));
  else kids.push(R({ w: s, h: s, fill: "firoozeh/700", name: "Photo" }));
  const a = F({ name: "Avatar", dir: "H", w: s, h: s, align: "center", cross: "center", radius: "radius/full", fill: type === "Initials" ? t.bg : "bg-tertiary", stroke: "border-secondary", clip: type === "Image" }, kids);
  if (!status) return a;
  const dot = Math.max(8, Math.round(s * 0.28));
  return F({ name: "Avatar", dir: "none", w: s, h: s }, [
    (() => { SIZING.set(a, { x: 0, y: 0 }); return a; })(),
    R({ ellipse: true, w: dot, h: dot, fill: { Online: "text-success", Busy: "text-error", Away: "text-warning" }[status], stroke: "bg-primary", sw: 2, name: "Status", x: s - dot, y: s - dot }),
  ]);
}

function card({ variant = "Default", padding = "md", title = "گزارش ماهانه", description = "خلاصهٔ عملکرد تیم در آبان", media, footer = true, w = 360 } = {}) {
  const fill = variant === "Filled" ? "bg-secondary" : "bg-elevated";
  const stroke = variant === "Default" || variant === "Flat" ? "border-secondary" : variant === "Elevated" ? "border-secondary" : undefined;
  const shadow = variant === "Elevated" ? "Elevated" : variant === "Default" ? "Shadow/xs" : undefined;
  const pad = `card/padding/${padding}`;
  return F({ name: "Card", dir: "V", gap: 0, w, radius: "radius/xl", fill, stroke, shadow, clip: true }, [
    media && R({ w, h: 160, fill: "bg-tertiary", name: "Media" }),
    F({ name: "Header", dir: "H", gap: "space/4", p: pad, w: "fill", cross: "start" }, [
      F({ name: "Heading", dir: "V", gap: "space/1", grow: true }, [
        T(title, { style: "Text lg/Semibold", color: "text-primary", name: "Title" }),
        T(description, { style: "Text sm/Regular", color: "text-tertiary", name: "Description" }),
      ]),
      I("more-vertical", 20, "text-quaternary"),
    ]),
    F({ name: "Body", dir: "V", gap: "space/3", px: pad, pb: pad, w: "fill" }, [
      T("۱۲ پروژه تکمیل شد و رضایت مشتری ۸٪ بیشتر شد. جزئیات کامل در داشبورد تحلیل در دسترس است.", { style: "Text sm/Regular", color: "text-secondary", w: "fill", name: "Content" }),
    ]),
    footer && F({ name: "Footer", dir: "H", gap: "space/3", px: pad, py: 16, w: "fill", align: "end", stroke: "border-secondary", sides: [1, 0, 0, 0] }, [
      button({ variant: "Tertiary", size: "sm", label: "بعداً" }),
      button({ variant: "Secondary", size: "sm", label: "مشاهدهٔ گزارش" }),
    ]),
  ]);
}

function buildData() {
  const { page, root } = kitPage("📊 Data display", "نمایش داده", "نشان، آواتار، کارت، آمار، جدول، خط زمان، درخت، آکاردئون و نمودار.");

  safe("Badge", () => section(root, "Badge · نشان", "شش لحن × سه سبک × سه اندازه؛ نقطه قابل خاموش شدن است.", (h) => {
    componentSet(h, "Badge", {
      axes: { Tone: Object.keys(BADGE_TONES), Variant: ["Soft", "Solid", "Outline"], Size: ["sm", "md", "lg"] },
      build: (p) => badge({ tone: p.Tone, variant: p.Variant, size: p.Size, label: { Neutral: "پیش‌نویس", Brand: "جدید", Info: "در حال بررسی", Success: "فعال", Warning: "در انتظار", Error: "لغو شده" }[p.Tone] }),
      text: { Label: ["Label", "فعال"] },
      bools: { Dot: ["Dot", true] },
      cols: 9,
      gap: 16,
      docs: "badge",
    });
  }));

  safe("Chip", () => section(root, "Chip · تراشه", "فیلترهای قابل انتخاب، با شمارنده.", (h) => {
    componentSet(h, "Chip", {
      axes: { Selected: ["Off", "On"], State: ["Default", "Hover", "Disabled"] },
      build: (p) => {
        const on = p.Selected === "On";
        const dis = p.State === "Disabled";
        const fg = dis ? "text-quaternary" : on ? "text-brand" : p.State === "Hover" ? "text-primary" : "text-secondary";
        const f = F({ name: "Chip", dir: "H", gap: "space/1.5", h: 32, px: "space/3", cross: "center", radius: "radius/full", fill: on ? "bg-brand-subtle" : "bg-elevated", stroke: on ? "border-brand" : "border-primary" }, [
          on && I("check", 16, fg),
          T("ارسال رایگان", { style: "Text sm/Medium", color: fg, name: "Label" }),
          F({ name: "Count", dir: "H", px: 6, h: 20, cross: "center", radius: "radius/full", fill: on ? "bg-brand-subtle" : "bg-tertiary" }, [T("۱۲", { style: "Text xs/Medium", color: fg })]),
        ]);
        if (p.State === "Hover" && !on) f.fills = [paint("bg-elevated"), paint("bg-hover")];
        return f;
      },
      text: { Label: ["Label", "ارسال رایگان"] },
      bools: { "Show count": ["Count", true] },
      docs: "chip",
    });
  }));

  safe("Avatar", () => section(root, "Avatar · آواتار", "حروف اول با رنگ خودکار، تصویر یا آیکون؛ با نشان وضعیت.", (h) => {
    componentSet(h, "Avatar", {
      axes: { Size: Object.keys(AVATAR_SIZES), Type: ["Initials", "Image", "Icon"], Status: ["None", "Online", "Busy", "Away"] },
      build: (p) => avatar({ size: p.Size, type: p.Type, status: p.Status === "None" ? undefined : p.Status }),
      cols: 12,
      gap: 16,
      docs: "avatar",
    });
    componentSet(h, "Avatar group", {
      axes: { Size: ["sm", "md"] },
      build: (p) => {
        const tones = ["Brand", "Info", "Success", "Warning"];
        const names = ["سپ", "مر", "عل", "زه"];
        const g = F({ name: "Avatar group", dir: "H", gap: p.Size === "sm" ? -8 : -10, cross: "center" }, [
          ...tones.map((t, i) => { const a = avatar({ size: p.Size, tone: t, initials: names[i] }); a.strokes = [paint("bg-primary")]; a.strokeWeight = 2; return a; }),
          F({ name: "More", dir: "H", w: AVATAR_SIZES[p.Size], h: AVATAR_SIZES[p.Size], align: "center", cross: "center", radius: "radius/full", fill: "bg-tertiary", stroke: "bg-primary", sw: 2 }, [T("+۵", { style: "Text xs/Semibold", color: "text-secondary" })]),
        ]);
        return g;
      },
      docs: "avatar",
    });
    componentSet(h, "User", {
      axes: { Size: ["sm", "md", "lg"] },
      build: (p) => F({ name: "User", dir: "H", gap: "space/3", cross: "center" }, [
        avatar({ size: p.Size, status: "Online" }),
        F({ dir: "V", gap: 0 }, [T("سپنتا پویا", { style: p.Size === "lg" ? "Text md/Semibold" : "Text sm/Semibold", color: "text-primary", name: "Name" }), T("طراح محصول", { style: "Text sm/Regular", color: "text-tertiary", name: "Role" })]),
      ]),
      text: { Name: ["Name", "سپنتا پویا"], Role: ["Role", "طراح محصول"] },
      docs: "avatar",
    });
  }));

  safe("Card", () => section(root, "Card · کارت", "چهار گونه و سه فاصلهٔ داخلی؛ هدر با دکمه‌های عملیات.", (h) => {
    componentSet(h, "Card", {
      axes: { Variant: ["Default", "Flat", "Elevated", "Filled"], Padding: ["sm", "md", "lg"] },
      build: (p) => card({ variant: p.Variant, padding: p.Padding }),
      text: { Title: ["Title", "گزارش ماهانه"], Description: ["Description", "خلاصهٔ عملکرد تیم در آبان"] },
      bools: { "Show footer": ["Footer", true] },
      cols: 3,
      docs: "card",
    });
    componentSet(h, "Media card", { build: () => card({ media: true, title: "سفر به اصفهان", description: "۶ آبان ۱۴۰۵ · ۵ دقیقه مطالعه" }), docs: "card" });
  }));

  safe("Stat", () => section(root, "Stat card · کارت آمار", "عدد کلیدی با تغییر نسبت به دورهٔ قبل و نمودار کوچک.", (h) => {
    componentSet(h, "Stat card", {
      axes: { Trend: ["Up", "Down", "Neutral"] },
      build: (p) => {
        const c = { Up: "text-success", Down: "text-error", Neutral: "text-tertiary" }[p.Trend];
        const pts = { Up: [6, 10, 8, 14, 12, 18, 22], Down: [20, 18, 19, 13, 14, 9, 6], Neutral: [12, 13, 11, 12, 13, 12, 12] }[p.Trend];
        const spark = F({ name: "Sparkline", dir: "H", gap: 4, cross: "end", h: 40 }, pts.map((v) => R({ w: 8, h: v + 4, radius: 2, fill: c, fillOpacity: 0.7, name: "Bar" })));
        return F({ name: "Stat card", dir: "V", gap: "space/4", p: "space/6", w: 300, radius: "radius/xl", fill: "bg-elevated", stroke: "border-secondary", shadow: "Shadow/xs" }, [
          F({ dir: "H", w: "fill", align: "between", cross: "center" }, [T("درآمد ماهانه", { style: "Text sm/Medium", color: "text-tertiary", name: "Label" }), I("more-vertical", 18, "text-quaternary")]),
          F({ dir: "H", w: "fill", align: "between", cross: "end" }, [
            F({ dir: "V", gap: "space/2" }, [
              F({ dir: "H", gap: "space/1", cross: "baseline" }, [T("۴۸٫۲", { style: "Display 2xl/Semibold", color: "text-primary", name: "Value" }), T("میلیون تومان", { style: "Text sm/Regular", color: "text-tertiary" })]),
              F({ dir: "H", gap: "space/1", cross: "center" }, [
                F({ dir: "H", px: 6, h: 22, gap: 2, cross: "center", radius: "radius/full", fill: { Up: "bg-success-subtle", Down: "bg-error-subtle", Neutral: "bg-tertiary" }[p.Trend] }, [T({ Up: "↑ ۱۲٪", Down: "↓ ۸٪", Neutral: "۰٪" }[p.Trend], { style: "Text xs/Semibold", color: c })]),
                T("نسبت به ماه قبل", { style: "Text sm/Regular", color: "text-tertiary" }),
              ]),
            ]),
            spark,
          ]),
        ]);
      },
      text: { Label: ["Label", "درآمد ماهانه"], Value: ["Value", "۴۸٫۲"] },
      docs: "stat",
    });
  }));

  safe("Table", () => section(root, "Table · جدول", "سربرگ چسبان، ردیف قابل انتخاب، راه‌راه و پانویس با صفحه‌بندی.", (h) => {
    const cols = [["مشتری", 220], ["وضعیت", 130], ["مبلغ", 140], ["تاریخ", 120], ["", 56]];
    const rows = [
      ["سپنتا پویا", "Success", "۲٬۴۵۰٬۰۰۰", "۱۴۰۵/۰۸/۰۶"],
      ["مریم رضایی", "Warning", "۸۹۰٬۰۰۰", "۱۴۰۵/۰۸/۰۵"],
      ["علی محمدی", "Success", "۱۲٬۰۰۰٬۰۰۰", "۱۴۰۵/۰۸/۰۳"],
      ["زهرا کریمی", "Error", "۳۲۰٬۰۰۰", "۱۴۰۵/۰۸/۰۱"],
    ];
    const statusLabel = { Success: "پرداخت شده", Warning: "در انتظار", Error: "لغو شده" };
    componentSet(h, "Table", {
      axes: { Style: ["Default", "Striped", "Selectable"] },
      build: (p) => {
        const sel = p.Style === "Selectable";
        const cell = (w, kids, o = {}) => F(Object.assign({ name: "Cell", dir: "H", gap: "space/3", w, px: "space/6", h: o.head ? 44 : 64, cross: "center" }, o), kids);
        const header = F({ name: "Header row", dir: "H", gap: 0, w: "fill", fill: "bg-secondary", stroke: "border-secondary", sides: [0, 0, 1, 0] }, [
          sel && cell(56, [checkMark("checkbox", { checked: "Indeterminate", size: 18 })], { head: true, ps: 24, px: 0 }),
          ...cols.map(([c, w]) => cell(w, [T(c, { style: "Text xs/Medium", color: "text-tertiary" })], { head: true })),
        ]);
        const body = rows.map((r, i) => F({ name: "Row", dir: "H", gap: 0, w: "fill", fill: sel && i === 1 ? "bg-brand-subtle" : p.Style === "Striped" && i % 2 ? "bg-secondary" : undefined, stroke: "border-secondary", sides: i < rows.length - 1 ? [0, 0, 1, 0] : [0, 0, 0, 0] }, [
          sel && cell(56, [checkMark("checkbox", { checked: i === 1 ? "On" : "Off", size: 18 })], { ps: 24, px: 0 }),
          cell(cols[0][1], [avatar({ size: "sm", tone: ["Brand", "Info", "Success", "Warning"][i], initials: r[0].slice(0, 2) }), T(r[0], { style: "Text sm/Medium", color: "text-primary" })]),
          cell(cols[1][1], [badge({ tone: r[1], size: "sm", label: statusLabel[r[1]] })]),
          cell(cols[2][1], [T(r[2], { style: "Text sm/Regular", color: "text-tertiary" })]),
          cell(cols[3][1], [T(r[3], { style: "Text sm/Regular", color: "text-tertiary" })]),
          cell(cols[4][1], [I("more-vertical", 18, "text-quaternary")], { px: 16 }),
        ]));
        const totalW = cols.reduce((a, [, w]) => a + w, 0) + (sel ? 56 : 0);
        return F({ name: "Table", dir: "V", gap: 0, w: totalW, radius: "radius/xl", fill: "bg-elevated", stroke: "border-secondary", clip: true }, [
          F({ name: "Caption", dir: "H", gap: "space/4", pt: "space/5", pb: "space/4", px: "space/6", w: "fill", cross: "start" }, [
            F({ dir: "V", gap: "space/1", grow: true }, [
              F({ dir: "H", gap: "space/2", cross: "center" }, [T("تراکنش‌ها", { style: "Text lg/Semibold", color: "text-primary", name: "Title" }), badge({ tone: "Brand", size: "sm", label: "۱۲۸ مورد", dot: false })]),
              T("پرداخت‌های ۳۰ روز گذشته", { style: "Text sm/Regular", color: "text-tertiary" }),
            ]),
            button({ variant: "Secondary", size: "sm", label: "خروجی اکسل", iconStart: "download" }),
          ]),
          header,
          ...body,
          F({ name: "Footer", dir: "H", py: "space/3", px: "space/6", w: "fill", align: "between", cross: "center", stroke: "border-secondary", sides: [1, 0, 0, 0] }, [
            button({ variant: "Secondary", size: "sm", label: "قبلی", iconStart: "arrow-right" }),
            T("صفحهٔ ۱ از ۱۰", { style: "Text sm/Medium", color: "text-secondary" }),
            button({ variant: "Secondary", size: "sm", label: "بعدی", iconEnd: "arrow-left" }),
          ]),
        ]);
      },
      cols: 1,
      docs: "data-table",
    });
  }));

  safe("Timeline", () => section(root, "Timeline · خط زمان", "رویدادها به ترتیب زمان با زمان نسبی فارسی («۵ دقیقه پیش»).", (h) => {
    componentSet(h, "Timeline", {
      build: () => {
        const items = [["سفارش ثبت شد", "۲ ساعت پیش", "cart", "Brand"], ["پرداخت تأیید شد", "۱ ساعت پیش", "credit-card", "Success"], ["در حال ارسال", "۱۵ دقیقه پیش", "send", "Info"], ["تحویل", "در انتظار", "home", null]];
        return F({ name: "Timeline", dir: "V", gap: 0, w: 320 }, items.map(([title, time, icon, tone], i) =>
          F({ name: "Item", dir: "H", gap: "space/3", w: "fill", cross: "start" }, [
            F({ name: "Rail", dir: "V", gap: 4, cross: "center" }, [
              tone ? featuredIcon(icon, tone, 32) : F({ dir: "H", w: 32, h: 32, align: "center", cross: "center", radius: "radius/full", stroke: "border-primary", dash: [3, 3] }, [I(icon, 16, "text-quaternary")]),
              i < items.length - 1 && R({ w: 2, h: 28, radius: 1, fill: tone ? "border-primary" : "border-secondary", name: "Line" }),
            ]),
            F({ dir: "V", gap: 0, pt: 4 }, [T(title, { style: "Text sm/Semibold", color: tone ? "text-primary" : "text-tertiary" }), T(time, { style: "Text sm/Regular", color: "text-tertiary" })]),
          ]),
        ));
      },
      docs: "timeline",
    });
  }));

  safe("Tree", () => section(root, "Tree view · نمای درختی", "پوشه‌ها و فایل‌ها با کیبورد قابل پیمایش‌اند (الگوی tree در WAI-ARIA).", (h) => {
    componentSet(h, "Tree view", {
      build: () => {
        const items = [[0, "folder", "packages", true], [1, "folder", "react", true], [2, "file", "Button.tsx"], [2, "file", "Input.tsx", false, true], [1, "folder", "persian"], [0, "file", "package.json"]];
        return F({ name: "Tree", dir: "V", gap: 2, p: "space/2", w: 280, radius: "radius/lg", fill: "bg-elevated", stroke: "border-secondary" }, items.map(([lvl, icon, label, open, sel]) =>
          F({ name: "Node", dir: "H", gap: "space/1.5", h: 32, ps: 8 + lvl * 20, pe: 8, w: "fill", cross: "center", radius: "radius/md", fill: sel ? "bg-brand-subtle" : undefined }, [
            icon === "folder" ? I(open ? "chevron-down" : "chevron-left", 16, "text-quaternary") : R({ w: 16, h: 16, name: "Indent" }),
            I(icon, 18, sel ? "text-brand" : icon === "folder" ? "zafaran/400" : "text-tertiary"),
            T(label, { style: "Text sm/Medium", color: sel ? "text-brand" : "text-secondary", ltr: true }),
          ]),
        ));
      },
      docs: "tree-view",
    });
  }));

  safe("Accordion", () => section(root, "Accordion · آکاردئون", "پرسش‌های متداول؛ یک یا چند بخش باز.", (h) => {
    componentSet(h, "Accordion item", {
      axes: { State: ["Collapsed", "Expanded"] },
      build: (p) => {
        const open = p.State === "Expanded";
        return F({ name: "Accordion item", dir: "V", gap: "space/2", py: "space/4", w: 480, stroke: "border-secondary", sides: [0, 0, 1, 0] }, [
          F({ name: "Trigger", dir: "H", w: "fill", align: "between", cross: "center" }, [T("کاشی رایگان است؟", { style: "Text md/Semibold", color: "text-primary", name: "Question" }), I(open ? "minus" : "plus", 20, "text-tertiary")]),
          open && T("بله. کاشی متن‌باز و تحت مجوز MIT است و در پروژه‌های تجاری هم می‌توانید از آن استفاده کنید.", { style: "Text sm/Regular", color: "text-tertiary", w: "fill", name: "Answer" }),
        ]);
      },
      text: { Question: ["Question", "کاشی رایگان است؟"] },
      docs: "accordion",
    });
  }));

  safe("Misc", () => section(root, "Kbd, Divider, Relative time · کلید، جداکننده، زمان نسبی", "اجزای کوچک پرکاربرد.", (h) => {
    componentSet(h, "Kbd", {
      axes: { Key: ["⌘", "Ctrl", "K", "Enter", "Esc"] },
      build: (p) => F({ name: "Kbd", dir: "H", h: 22, px: 6, align: "center", cross: "center", radius: "radius/sm", fill: "bg-secondary", stroke: "border-primary", sides: [1, 1, 2, 1], minW: 22 }, [T(p.Key, { style: "Text xs/Medium", color: "text-secondary", ltr: true, align: "center" })]),
      docs: "kbd",
    });
    componentSet(h, "Divider", {
      axes: { Type: ["Line", "Label"] },
      build: (p) => F({ name: "Divider", dir: "H", gap: "space/3", w: 360, cross: "center" }, p.Type === "Line"
        ? [R({ w: 360, h: 1, fill: "border-secondary", name: "Line", grow: true })]
        : [R({ w: 100, h: 1, fill: "border-secondary", name: "Line", grow: true }), T("یا", { style: "Text sm/Medium", color: "text-tertiary", name: "Label" }), R({ w: 100, h: 1, fill: "border-secondary", name: "Line", grow: true })]),
      docs: "divider",
    });
    componentSet(h, "Relative time", {
      axes: { Value: ["Now", "Minutes", "Yesterday", "Date"] },
      build: (p) => F({ name: "Relative time", dir: "H", gap: "space/1", cross: "center" }, [
        I("clock", 16, "text-quaternary"),
        T({ Now: "همین الان", Minutes: "۵ دقیقه پیش", Yesterday: "دیروز ساعت ۱۴:۳۰", Date: "۶ آبان ۱۴۰۵" }[p.Value], { style: "Text sm/Regular", color: "text-tertiary", name: "Time" }),
      ]),
      docs: "relative-time",
    });
  }));

  safe("Heatmap", () => section(root, "Activity heatmap · نقشهٔ فعالیت", "فعالیت روزانه به سبک GitHub با ماه‌های شمسی.", (h) => {
    componentSet(h, "Activity heatmap", {
      build: () => {
        const levels = ["bg-tertiary", "firoozeh/900", "firoozeh/700", "firoozeh/500", "firoozeh/300"];
        let seed = 7;
        const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
        const weeks = Array.from({ length: 26 }, () => F({ name: "Week", dir: "V", gap: 3 }, Array.from({ length: 7 }, () => R({ w: 12, h: 12, radius: 3, fill: levels[Math.floor(rnd() * rnd() * 5)], name: "Day" }))));
        return F({ name: "Heatmap", dir: "V", gap: "space/3", p: "space/5", radius: "radius/xl", fill: "bg-elevated", stroke: "border-secondary" }, [
          F({ dir: "H", w: "fill", align: "between" }, [T("۴۸۲ فعالیت در شش ماه گذشته", { style: "Text sm/Semibold", color: "text-primary" }), T("۱۴۰۵", { style: "Text sm/Regular", color: "text-tertiary" })]),
          F({ name: "Weeks", dir: "H", gap: 3 }, weeks),
          F({ dir: "H", gap: 4, cross: "center", w: "fill", align: "end" }, [T("کمتر", { style: "Text xs/Regular", color: "text-tertiary" }), ...levels.map((l) => R({ w: 12, h: 12, radius: 3, fill: l, name: "Level" })), T("بیشتر", { style: "Text xs/Regular", color: "text-tertiary" })]),
        ]);
      },
      docs: "activity-heatmap",
    });
  }));

  safe("Chart", () => section(root, "Chart · نمودار", "نمودار میله‌ای و خطی ساده با ماه‌های شمسی.", (h) => {
    componentSet(h, "Bar chart", {
      build: () => {
        const vals = [42, 58, 51, 74, 66, 88];
        const months = TOKENS.calendar.months.slice(2, 8);
        const H = 160;
        return F({ name: "Bar chart", dir: "V", gap: "space/4", p: "space/6", w: 480, radius: "radius/xl", fill: "bg-elevated", stroke: "border-secondary" }, [
          F({ dir: "H", w: "fill", align: "between", cross: "center" }, [T("فروش شش ماه اخیر", { style: "Text md/Semibold", color: "text-primary", name: "Title" }), F({ dir: "H", gap: "space/2", cross: "center" }, [R({ ellipse: true, w: 8, h: 8, fill: "bg-brand" }), T("میلیون تومان", { style: "Text xs/Regular", color: "text-tertiary" })])]),
          F({ name: "Plot", dir: "H", gap: "space/4", w: "fill", h: H + 24, align: "between", cross: "end" }, vals.map((v, i) =>
            F({ name: "Bar", dir: "V", gap: "space/2", cross: "center", grow: true }, [
              T(fa(v), { style: "Text xs/Medium", color: "text-tertiary", align: "center" }),
              R({ w: 40, h: (v / 100) * H, radius: [6, 6, 0, 0], fill: i === vals.length - 1 ? "bg-brand" : "firoozeh/800", name: "Value" }),
              T(months[i], { style: "Text xs/Regular", color: "text-tertiary", align: "center" }),
            ]),
          )),
        ]);
      },
      docs: "chart",
    });
  }));

  safe("Carousel", () => section(root, "Carousel · اسلایدر تصویر", "با دکمه‌ها و نقطه‌های راهنما؛ با کیبورد هم کار می‌کند.", (h) => {
    componentSet(h, "Carousel", {
      build: () => F({ name: "Carousel", dir: "V", gap: "space/3", w: 480, cross: "center" }, [
        F({ name: "Viewport", dir: "H", w: "fill", h: 240, radius: "radius/xl", fill: "firoozeh/800", align: "between", cross: "center", px: "space/4" }, [
          button({ variant: "Secondary", size: "sm", iconOnly: "chevron-right", pill: true }),
          T("اسلاید ۲ از ۵", { style: "Text md/Semibold", color: "#ffffff" }),
          button({ variant: "Secondary", size: "sm", iconOnly: "chevron-left", pill: true }),
        ]),
        F({ name: "Dots", dir: "H", gap: 6 }, [1, 2, 3, 4, 5].map((i) => R({ w: i === 2 ? 20 : 8, h: 8, radius: "radius/full", fill: i === 2 ? "bg-brand" : "bg-tertiary", name: "Dot" }))),
      ]),
      docs: "carousel",
    });
  }));
  return page;
}
