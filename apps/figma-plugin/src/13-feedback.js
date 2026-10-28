// بازخورد: هشدار، اعلان، پیشرفت، دیالوگ، راهنما و ...

const TONES = {
  Brand: { fg: "text-brand", bg: "bg-brand-subtle", icon: "info" },
  Info: { fg: "text-info", bg: "bg-info-subtle", icon: "info" },
  Success: { fg: "text-success", bg: "bg-success-subtle", icon: "success" },
  Warning: { fg: "text-warning", bg: "bg-warning-subtle", icon: "warning" },
  Error: { fg: "text-error", bg: "bg-error-subtle", icon: "error" },
};

/** آیکون برجسته با هالهٔ رنگی (Untitled UI) */
function featuredIcon(name, tone = "Brand", size = 40, halo = 0) {
  const t = TONES[tone];
  // هالهٔ دور آیکون دیالوگ: حاشیهٔ بیرونی ۸ پیکسل با نیمی از همان رنگ (box-shadow در CSS)
  return F({ name: "Featured icon", dir: "H", w: size, h: size, align: "center", cross: "center", radius: "radius/full", fill: t.bg,
    stroke: halo ? t.bg : undefined, sw: halo || undefined, strokeAlign: halo ? "OUTSIDE" : undefined, strokeOpacity: halo ? 0.5 : undefined }, [I(name || t.icon, size / 2, t.fg)]);
}

function spinner(size = 20, color = "bg-brand") {
  return F({ name: "Spinner", dir: "none", w: size, h: size }, [
    R({ ellipse: true, w: size, h: size, fill: "bg-tertiary", arc: { startingAngle: 0, endingAngle: Math.PI * 2, innerRadius: 0.78 }, name: "Track", x: 0, y: 0 }),
    R({ ellipse: true, w: size, h: size, fill: color, arc: { startingAngle: -Math.PI / 2, endingAngle: Math.PI / 2, innerRadius: 0.78 }, name: "Arc", x: 0, y: 0 }),
  ]);
}

function buildFeedback() {
  const root = kitPage("💬", "Feedback", "بازخورد", "هشدار، اعلان، پیشرفت، دیالوگ و راهنما. نقش‌های ARIA (role=status، alert، dialog) در کد React رعایت شده‌اند.");

  safe("Alert", () => section(root, "Alert · هشدار", "پنج لحن، سه چیدمان. عنوان، متن و دکمه‌ها از پنل ویژگی‌ها.", (h) => {
    componentSet(h, "Alert", {
      axes: { Tone: Object.keys(TONES), Layout: ["Default", "Tinted", "Small"] },
      build: (p) => {
        const t = TONES[p.Tone];
        const small = p.Layout === "Small";
        const tinted = p.Layout === "Tinted";
        // k-alert__icon: آیکون ۲۰ با دو حلقهٔ هم‌مرکز (۳۰ و ۴۰ پیکسل) در قاب ۳۲
        const icon = small
          ? F({ name: "Icon", dir: "H", w: 24, h: 24, align: "center", cross: "center" }, [I(t.icon, 16, t.fg)])
          : F({ name: "Icon", dir: "none", w: 32, h: 32 }, [
              R({ ellipse: true, w: 40, h: 40, stroke: t.fg, sw: 2, name: "Ring outer", x: -4, y: -4 }),
              R({ ellipse: true, w: 30, h: 30, stroke: t.fg, sw: 2, name: "Ring inner", x: 1, y: 1 }),
              (() => { const i = I(t.icon, 20, t.fg); SIZING.set(i, { x: 6, y: 6 }); return i; })(),
            ]);
        if (!small) { icon.findOne((n) => n.name === "Ring outer").opacity = 0.1; icon.findOne((n) => n.name === "Ring inner").opacity = 0.3; }
        const css = ["k-alert", `k-alert--${p.Tone.toLowerCase()}`, small && "k-alert--sm", tinted && "k-alert--tinted"].filter(Boolean).sort().join(" ");
        const box = F({ name: "Alert", dir: "H", gap: small ? "space/3" : "space/4", p: small ? 12 : "alert/padding", w: 460, cross: "start", radius: small ? "radius/lg" : "radius/xl", fill: "bg-secondary", stroke: tinted ? t.fg : "border-primary", strokeOpacity: tinted ? 0.32 : undefined, shadow: tinted ? undefined : "Surface",
          css: tinted ? undefined : css, cssCheck: ["pad", "radius", "gap", "bg", "border"] }, [
          icon,
          F({ name: "Content", dir: "V", gap: "space/1", grow: true, pt: 2, css: small ? undefined : "k-alert__content", cssCheck: ["pad", "gap"] }, [
            T("تغییرات ذخیره شد", { style: "Text sm/Semibold", color: "text-secondary", name: "Title", css: "k-alert__title" }),
            !small && T("نسخهٔ جدید پیش‌نویس شما در فضای ابری ذخیره شد و برای همهٔ اعضای تیم در دسترس است.", { style: "Text sm/Regular", color: "text-tertiary", name: "Description", w: "fill", css: "k-alert__description" }),
            !small && F({ name: "Actions", dir: "H", gap: "space/3", pt: "space/2" }, [
              T("نادیده گرفتن", { style: "Text sm/Semibold", color: "text-tertiary", name: "Dismiss" }),
              T("مشاهدهٔ تغییرات", { style: "Text sm/Semibold", color: t.fg, name: "Action" }),
            ]),
          ]),
          button({ variant: "Tertiary", size: "sm", iconOnly: "close" }),
        ]);
        // رنگ پس‌زمینهٔ tinted: ۸٪ رنگ لحن روی bg-primary
        if (tinted) box.fills = [paint("bg-primary"), paint(t.fg, 0.08)];
        return box;
      },
      text: { Title: ["Title", "تغییرات ذخیره شد"] },
      bools: { "Show actions": ["Actions", true] },
      cols: 3,
      docs: "alert",
    });
  }));

  safe("Banner", () => section(root, "Banner · بنر", "پیام برجسته با آیکون قاب‌دار و دکمه؛ مثل اطلاع از نسخهٔ جدید.", (h) => {
    componentSet(h, "Banner", {
      axes: { Tone: ["Brand", "Warning", "Error"] },
      build: (p) => {
        const t = TONES[p.Tone];
        // k-banner: کارت با فاصلهٔ ۱۲/۱۶، پس‌زمینهٔ رنگ لحن و آیکون ۳۲ در قاب
        return F({ name: "Banner", dir: "H", gap: "space/4", py: "space/3", px: "space/4", w: 720, cross: "center", radius: "radius/xl", fill: t.bg, stroke: "border-secondary", shadow: "Surface",
          css: `k-banner k-banner--${p.Tone.toLowerCase()}`, cssCheck: ["pad", "radius", "bg", "border"] }, [
          F({ name: "Icon", dir: "H", w: 32, h: 32, align: "center", cross: "center", radius: "radius/md", fill: "bg-elevated", stroke: "border-primary", shadow: "Button", css: "k-banner__icon", cssCheck: ["radius", "bg", "border"] }, [I(t.icon, 18, t.fg)]),
          T("نسخهٔ ۰٫۱۵ کاشی منتشر شد؛ PersianInput با پلاک و ساعت.", { style: "Text sm/Regular", color: "text-secondary", name: "Message", grow: true, css: "k-banner__text" }),
          F({ name: "Actions", dir: "H", gap: "space/2", cross: "center", css: "k-banner__actions", cssCheck: ["gap"] }, [
            button({ variant: "Secondary", size: "sm", label: "مشاهده" }),
            button({ variant: "Tertiary", size: "sm", iconOnly: "close" }),
          ]),
        ]);
      },
      text: { Message: ["Message", "نسخهٔ ۰٫۱۵ کاشی منتشر شد؛ PersianInput با پلاک و ساعت."] },
      cols: 1,
      docs: "banner",
    });
  }));

  safe("Toast", () => section(root, "Toast · اعلان شناور", "با نوار زمان و دکمهٔ واگرد.", (h) => {
    componentSet(h, "Toast", {
      axes: { Tone: ["Neutral", "Success", "Error", "Warning", "Info", "Loading"] },
      build: (p) => {
        const t = TONES[p.Tone];
        const titles = { Neutral: "پیش‌نویس ذخیره شد", Success: "پرداخت انجام شد", Error: "ارسال ناموفق بود", Warning: "اتصال ضعیف است", Info: "نسخهٔ جدید آماده است", Loading: "در حال آپلود…" };
        return F({ name: "Toast", dir: "V", gap: 0, w: 384, radius: "radius/xl", fill: "bg-elevated", stroke: "border-secondary", shadow: "Popover", clip: true }, [
          F({ name: "Body", dir: "H", gap: "space/3", p: "space/4", w: "fill", cross: "start" }, [
            p.Tone === "Loading" ? spinner(20) : I(t ? t.icon : "check", 20, t ? t.fg : "text-secondary"),
            F({ name: "Content", dir: "V", gap: 2, grow: true }, [
              T(titles[p.Tone], { style: "Text sm/Semibold", color: "text-primary", name: "Title" }),
              T("۲ ثانیه پیش", { style: "Text sm/Regular", color: "text-tertiary", name: "Description" }),
            ]),
            p.Tone === "Neutral" && T("واگرد", { style: "Text sm/Semibold", color: "text-brand", name: "Action" }),
            I("close", 18, "text-quaternary"),
          ]),
          R({ w: 240, h: 2, fill: t ? t.fg : "text-tertiary", name: "Timer" }),
        ]);
      },
      text: { Title: ["Title", "پیش‌نویس ذخیره شد"], Description: ["Description", "۲ ثانیه پیش"] },
      cols: 3,
      docs: "toast",
    });
  }));

  safe("Progress", () => section(root, "Progress · پیشرفت", "نوار پیشرفت، حلقه و اسپینر؛ حالت نامعین هم دارد.", (h) => {
    componentSet(h, "Progress", {
      axes: { Size: ["sm", "md", "lg"], Tone: ["Brand", "Success", "Warning", "Error"] },
      build: (p) => {
        const H = { sm: 4, md: 8, lg: 12 }[p.Size];
        const c = { Brand: "bg-brand", Success: "text-success", Warning: "text-warning", Error: "text-error" }[p.Tone];
        // k-progress-field: سربرگ با فاصلهٔ ۱۲، نوار با پس‌زمینهٔ bg-tertiary
        return F({ name: "Progress", dir: "V", gap: "space/2", w: 320, css: "k-progress-field", cssCheck: ["gap"] }, [
          F({ name: "Head", dir: "H", gap: "space/3", w: "fill", align: "between", css: "k-progress-field__head", cssCheck: ["gap"] }, [T("آپلود فایل‌ها", { style: "Text sm/Medium", color: "text-secondary", name: "Label", css: "k-progress-field__label" }), T("۶۸٪", { style: "Text sm/Regular", color: "text-tertiary", name: "Value", css: "k-progress-field__value" })]),
          F({ name: "Track", dir: "H", w: "fill", h: H, radius: "radius/full", fill: "bg-tertiary", clip: true, css: p.Size === "sm" ? "k-progress k-progress--sm" : p.Size === "md" ? "k-progress" : undefined, cssCheck: ["radius", "bg", "h"] }, [R({ w: 218, h: H, radius: "radius/full", fill: c, name: "Bar", css: p.Tone === "Brand" && p.Size === "md" ? "k-progress__bar" : undefined, cssCheck: ["radius", "bg", "h"] })]),
        ]);
      },
      cols: 4,
      docs: "progress",
    });
    componentSet(h, "Progress circle", {
      axes: { Size: ["sm", "md", "lg"] },
      build: (p) => {
        const s = { sm: 40, md: 56, lg: 80 }[p.Size];
        return F({ name: "Ring", dir: "none", w: s, h: s }, [
          R({ ellipse: true, w: s, h: s, fill: "bg-tertiary", arc: { startingAngle: 0, endingAngle: Math.PI * 2, innerRadius: 1 - 8 / s }, name: "Track", x: 0, y: 0 }),
          R({ ellipse: true, w: s, h: s, fill: "bg-brand", arc: { startingAngle: -Math.PI / 2, endingAngle: -Math.PI / 2 + Math.PI * 2 * 0.68, innerRadius: 1 - 8 / s }, name: "Value", x: 0, y: 0 }),
          p.Size !== "sm" && (() => { const t = T("۶۸٪", { style: "Text sm/Semibold", color: "text-primary", align: "center", size: Math.round(s * 0.24), weight: "semibold", leading: 1.2 }); t.textAutoResize = "NONE"; t.resize(s, s); t.textAlignVertical = "CENTER"; SIZING.set(t, { x: 0, y: 0 }); return t; })(),
        ]);
      },
      docs: "progress",
    });
    componentSet(h, "Spinner", { axes: { Size: ["sm", "md", "lg"] }, build: (p) => spinner({ sm: 16, md: 24, lg: 40 }[p.Size]), docs: "progress" });
  }));

  safe("Meter", () => section(root, "Meter · سنجه", "مقدار در یک بازهٔ شناخته‌شده، مثل فضای ذخیره‌سازی؛ با رنگ و متن وضعیت.", (h) => {
    componentSet(h, "Meter", {
      axes: { Level: ["Low", "Medium", "High"] },
      build: (p) => {
        const [pct, c, used, status] = { Low: [0.3, "bg-brand", "۳", null], Medium: [0.86, "text-warning", "۸٫۶", "نزدیک به سقف"], High: [0.97, "text-error", "۹٫۷", "فضا تقریباً پر است"] }[p.Level];
        const W = 320;
        // k-meter: سربرگ (برچسب و مقدار)، نوار ۸ پیکسلی و متن وضعیت
        return F({ name: "Meter", dir: "V", gap: "space/2", w: W, css: "k-meter", cssCheck: ["gap"] }, [
          F({ name: "Head", dir: "H", gap: "space/2", w: "fill", align: "between", cross: "baseline", css: "k-meter__head", cssCheck: ["gap"] }, [
            T("فضای ذخیره‌سازی", { style: "Text sm/Medium", color: "text-secondary", css: "k-meter__label" }),
            F({ dir: "H", gap: "space/1", cross: "baseline" }, [T(`${used} گیگابایت`, { style: "Text sm/Semibold", color: "text-primary", css: "k-meter__value" }), T("از ۱۰", { style: "Text sm/Regular", color: "text-tertiary" })]),
          ]),
          F({ name: "Track", dir: "H", w: "fill", h: 8, radius: "radius/full", fill: "bg-tertiary", clip: true, css: "k-meter__track", cssCheck: ["radius", "bg", "h"] }, [R({ w: Math.round(W * pct), h: 8, radius: "radius/full", fill: c, name: "Fill" })]),
          status && F({ name: "Status", dir: "H", gap: "space/1", cross: "center" }, [I("warning", 14, c), T(status, { style: "Text xs/Regular", color: c })]),
        ]);
      },
      docs: "meter",
    });
  }));

  safe("Skeleton", () => section(root, "Skeleton · اسکلت بارگذاری", "جای‌نگهدار هنگام بارگذاری؛ با prefers-reduced-motion انیمیشن نمی‌گیرد.", (h) => {
    componentSet(h, "Skeleton", {
      axes: { Type: ["Text", "Media", "Card"] },
      build: (p) => {
        const bar = (w, hh = 12) => R({ w, h: hh, radius: "radius/sm", fill: "bg-tertiary", name: "Bone" });
        if (p.Type === "Text") return F({ name: "Skeleton", dir: "V", gap: "space/2", w: 300 }, [bar(180, 16), bar(300), bar(260), bar(220)]);
        if (p.Type === "Media") return F({ name: "Skeleton", dir: "H", gap: "space/3", w: 300, cross: "center" }, [R({ ellipse: true, w: 40, h: 40, fill: "bg-tertiary", name: "Avatar" }), F({ dir: "V", gap: "space/2", grow: true }, [bar(140), bar(90)])]);
        return F({ name: "Skeleton", dir: "V", gap: "space/3", p: "space/4", w: 300, radius: "radius/xl", stroke: "border-secondary" }, [R({ w: 268, h: 140, radius: "radius/md", fill: "bg-tertiary", name: "Media" }), bar(180, 16), bar(240), bar(120)]);
      },
      docs: "skeleton",
    });
  }));

  safe("Empty", () => section(root, "Empty state · حالت خالی", "وقتی چیزی برای نمایش نیست؛ با راهنمای قدم بعدی.", (h) => {
    componentSet(h, "Empty state", {
      axes: { Type: ["Default", "Search", "Error"] },
      build: (p) => {
        const cfg = { Default: ["inbox", "هنوز پروژه‌ای ندارید", "اولین پروژه را بسازید تا اینجا نمایش داده شود.", "پروژهٔ جدید"], Search: ["search", "نتیجه‌ای پیدا نشد", "عبارت «کاشی ۲» با هیچ موردی منطبق نبود. املای آن را بررسی کنید.", "پاک کردن جستجو"], Error: ["warning", "مشکلی پیش آمد", "بارگذاری داده‌ها ناموفق بود. چند لحظه بعد دوباره تلاش کنید.", "تلاش دوباره"] }[p.Type];
        // k-empty: فاصلهٔ ۴۸/۲۴، آیکون ۴۰ با گوشهٔ ۱۲، دکمه‌ها ۱۶ پیکسل پایین‌تر
        return F({ name: "Empty state", dir: "V", gap: "space/2", py: "space/12", px: "space/6", w: 400, cross: "center", css: "k-empty", cssCheck: ["gap"] }, [
          F({ name: "Icon", dir: "H", w: 40, h: 40, align: "center", cross: "center", radius: "radius/lg", fill: "bg-elevated", stroke: "border-primary", shadow: "Button", css: "k-empty__icon", cssCheck: ["radius", "bg", "border"] }, [I(cfg[0], 24, p.Type === "Error" ? "text-error" : "text-secondary")]),
          T(cfg[1], { style: "Text md/Semibold", color: "text-primary", align: "center", name: "Title", css: "k-empty__title" }),
          T(cfg[2], { style: "Text sm/Regular", color: "text-tertiary", align: "center", w: 352, name: "Description", css: "k-empty__description" }),
          F({ name: "Actions", dir: "H", gap: "space/3", pt: "space/4" }, [p.Type === "Default" && button({ variant: "Secondary", label: "راهنما" }), button({ variant: p.Type === "Default" ? "Primary" : "Secondary", label: cfg[3], iconStart: p.Type === "Default" ? "plus" : undefined })]),
        ]);
      },
      docs: "empty-state",
    });
  }));

  safe("Tooltip", () => section(root, "Tooltip · راهنمای کوتاه", "چهار جهت؛ با فوکوس کیبورد هم باز می‌شود و با Esc بسته.", (h) => {
    componentSet(h, "Tooltip", {
      axes: { Placement: ["Top", "Bottom", "Start", "End"], Style: ["Short", "Rich"] },
      build: (p) => {
        const rich = p.Style === "Rich";
        // ارتفاع راهنمای کوتاه در CSS دقیقاً ۳۱ است (خط ۱٫۶)
        const bubble = F({ name: "Bubble", dir: "V", gap: 2, px: "space/3", py: rich ? "space/3" : undefined, h: rich ? undefined : 31, align: "center", radius: "radius/md", fill: "text-primary", shadow: "Shadow/lg", w: rich ? 240 : undefined }, [
          T(rich ? "میانبرهای کیبورد" : "کپی لینک", { style: rich ? "Text xs/Semibold" : "Text xs/Medium", color: "bg-primary", name: "Text" }),
          rich && T("برای دیدن همهٔ میانبرها کلید ? را بزنید.", { style: "Text xs/Regular", color: "bg-tertiary", w: "fill", name: "Description" }),
        ]);
        const arrow = R({ w: 10, h: 10, fill: "text-primary", rotation: 45, name: "Arrow" });
        const vertical = p.Placement === "Top" || p.Placement === "Bottom";
        const kids = p.Placement === "Top" || p.Placement === "Start" ? [bubble, arrow] : [arrow, bubble];
        return F({ name: "Tooltip", dir: vertical ? "V" : "H", gap: -5, cross: "center" }, kids);
      },
      text: { Text: ["Text", "کپی لینک"] },
      cols: 4,
      docs: "tooltip",
    });
  }));

  safe("Popover", () => section(root, "Popover · پنجرهٔ کوچک", "محتوای تعاملی کنار یک دکمه؛ فوکوس داخل آن به دام می‌افتد.", (h) => {
    componentSet(h, "Popover", {
      // k-popover: عرض ۳۲۰، فاصلهٔ ۱۶، گوشهٔ ۱۶
      build: () => F({ name: "Popover", dir: "V", gap: 0, p: "space/4", w: 320, radius: "radius/xl", fill: "bg-elevated", stroke: "border-secondary", shadow: "Popover", css: "k-popover" }, [
        T("اشتراک‌گذاری", { style: "Text sm/Semibold", color: "text-primary", name: "Title", css: "k-popover__title" }),
        F({ dir: "V", gap: "space/3", pt: "space/1", w: "fill" }, [
          T("هر کسی با لینک می‌تواند ببیند.", { style: "Text sm/Regular", color: "text-tertiary", name: "Body", w: "fill" }),
          F({ dir: "H", gap: "space/2", w: "fill" }, [inputBox({ size: "sm", text: "kashi.ir/s/4f9a", ltr: true }), button({ variant: "Secondary", size: "sm", iconStart: "copy", label: "کپی" })]),
        ]),
      ]),
      docs: "popover",
    });
  }));

  safe("Dialog", () => section(root, "Dialog · دیالوگ", "دیالوگ مودال و کشوی کناری؛ فوکوس به دام می‌افتد و با Esc بسته می‌شود.", (h) => {
    componentSet(h, "Dialog", {
      axes: { Type: ["Default", "Danger", "Form"] },
      build: (p) => {
        const danger = p.Type === "Danger";
        const form = p.Type === "Form";
        return F({ name: "Dialog", dir: "V", gap: 0, w: 480, radius: "radius/2xl", fill: "bg-elevated", stroke: "border-secondary", shadow: "Dialog", clip: true }, [
          F({ name: "Header", dir: "H", gap: "space/4", pt: "space/6", px: "space/6", w: "fill", cross: "start" }, [
            featuredIcon(danger ? "trash" : form ? "users" : "sparkle", danger ? "Error" : "Brand", 48, 8),
            F({ name: "Heading", dir: "V", gap: "space/1", grow: true, pt: "space/1" }, [
              T(danger ? "حذف پروژه" : form ? "دعوت هم‌تیمی" : "به کاشی خوش آمدید", { style: "Display lg/Semibold", color: "text-primary", name: "Title" }),
              T(danger ? "این کار برگشت‌پذیر نیست. همهٔ فایل‌ها و نظرها برای همیشه پاک می‌شوند." : form ? "ایمیل هم‌تیمی را وارد کنید تا دعوت‌نامه ارسال شود." : "دیزاین‌سیستم فارسی شما آماده است. از کجا شروع کنیم؟", { style: "Text sm/Regular", color: "text-tertiary", w: "fill", name: "Description" }),
            ]),
            button({ variant: "Tertiary", size: "sm", iconOnly: "close" }),
          ]),
          form && F({ name: "Body", dir: "V", gap: "space/4", pt: "space/5", px: "space/6", w: "fill" }, [
            field({ label: "ایمیل", w: "fill", control: inputBox({ iconStart: "mail", placeholder: "name@example.com", ltr: true }) }),
            field({ label: "نقش", w: "fill", control: inputBox({ text: "ویرایشگر", end: [I("chevron-down", 20, "text-tertiary")] }) }),
          ]),
          F({ name: "Footer", dir: "H", gap: "space/3", pt: "space/6", px: "space/6", pb: "space/6", w: "fill" }, [
            button({ variant: "Secondary", label: "انصراف", w: "fill" }),
            button({ variant: danger ? "Danger" : "Primary", label: danger ? "حذف" : form ? "ارسال دعوت" : "شروع کنید", w: "fill" }),
          ]),
        ]);
      },
      text: { Title: ["Title", "به کاشی خوش آمدید"], Description: ["Description", "دیزاین‌سیستم فارسی شما آماده است. از کجا شروع کنیم؟"] },
      docs: "dialog",
    });
    componentSet(h, "Drawer", {
      build: () => F({ name: "Drawer", dir: "V", gap: 0, w: 400, h: 560, fill: "bg-elevated", stroke: "border-secondary", sides: [0, 0, 0, 1], shadow: "Popover" }, [
        F({ name: "Header", dir: "H", p: "space/6", w: "fill", align: "between", stroke: "border-secondary", sides: [0, 0, 1, 0] }, [T("فیلترها", { style: "Text lg/Semibold", color: "text-primary", name: "Title" }), I("close", 20, "text-quaternary")]),
        F({ name: "Body", dir: "V", gap: "space/5", p: "space/6", w: "fill", grow: true }, [
          field({ label: "دسته‌بندی", w: "fill", control: inputBox({ text: "همه", end: [I("chevron-down", 20, "text-tertiary")] }) }),
          checkRow(checkMark("checkbox", { checked: "On" }), { label: "فقط موجود", description: "کالاهای ناموجود پنهان شوند." }),
          checkRow(switchTrack({ checked: "Off" }), { label: "ارسال رایگان", description: "سفارش‌های بالای ۵۰۰ هزار تومان" }),
        ]),
        F({ name: "Footer", dir: "H", gap: "space/3", p: "space/6", w: "fill", stroke: "border-secondary", sides: [1, 0, 0, 0] }, [button({ variant: "Secondary", label: "پاک کردن", w: "fill" }), button({ variant: "Primary", label: "اعمال", w: "fill" })]),
      ]),
      docs: "dialog",
    });
  }));

  safe("Tour", () => section(root, "Tour · راهنمای قدم‌به‌قدم", "معرفی بخش‌های محصول به کاربر تازه.", (h) => {
    componentSet(h, "Tour step", {
      axes: { Step: ["1", "2", "3"] },
      // k-tour__card: عرض ۳۲۰، فاصلهٔ ۱۶/۲۰، نوار پیشرفت ۱۶×۳
      build: (p) => F({ name: "Tour step", dir: "V", gap: "space/2", py: "space/4", px: "space/5", w: 320, radius: "radius/xl", fill: "bg-elevated", stroke: "border-secondary", shadow: "Popover" }, [
        T(`مرحلهٔ ${fa(p.Step)} از ۳`, { style: "Text xs/Semibold", color: "text-brand", css: "k-tour__step" }),
        T(["جستجوی سریع", "خروجی اکسل", "دعوت تیم"][Number(p.Step) - 1], { style: "Text md/Semibold", color: "text-primary", name: "Title", css: "k-tour__title" }),
        T("با ⌘K هر جای برنامه را باز کنید؛ از صفحه‌ها تا تنظیمات.", { style: "Text sm/Regular", color: "text-secondary", w: "fill", name: "Description" }),
        F({ name: "Actions", dir: "H", gap: "space/2", pt: "space/2", w: "fill", cross: "center" }, [
          F({ name: "Progress", dir: "H", gap: 4 }, [1, 2, 3].map((i) => R({ w: 16, h: 3, radius: 2, fill: i <= Number(p.Step) ? "bg-brand" : "border-primary", name: "Step" }))),
          Spacer(),
          p.Step !== "1" && button({ variant: "Tertiary", size: "sm", label: "قبلی" }),
          button({ variant: "Primary", size: "sm", label: p.Step === "3" ? "تمام" : "بعدی" }),
        ]),
      ]),
      docs: "tour",
    });
  }));
}
