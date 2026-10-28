// ناوبری: تب، مسیر، صفحه‌بندی، مراحل، منوی کناری، منو و جستجوی فرمان

function menuPanel(items, { w = 240 } = {}) {
  return F({ name: "Menu", dir: "V", gap: 0, p: "space/1.5", w, radius: "radius/lg", fill: "bg-elevated", stroke: "border-secondary", shadow: "Popover", css: "k-menu", cssCheck: ["pad", "radius", "bg", "border"] }, items.map((it) => {
    if (it === "-") return F({ name: "Separator", dir: "H", w: "fill", py: "space/1" }, [R({ w: 10, h: 1, fill: "border-secondary", fillW: true, name: "Line" })]);
    if (it.label && it.heading) return F({ name: "Group label", dir: "H", px: 10, pt: "space/2", pb: "space/1", w: "fill" }, [T(it.label, { style: "Text xs/Medium", color: "text-tertiary" })]);
    const fg = it.danger ? "text-error" : it.disabled ? "text-quaternary" : it.active ? "text-primary" : "text-secondary";
    return F({ name: "Menu item", dir: "H", gap: "space/2", h: "menu/item-height", px: 10, w: "fill", cross: "center", radius: "radius/md", fill: it.active ? (it.danger ? "bg-error-subtle" : "bg-hover") : undefined,
      css: it.active ? undefined : it.danger ? "k-menu__item k-menu__item--danger" : "k-menu__item", cssCheck: ["padx", "radius", "gap", "bg", "h"] }, [
      it.checked !== undefined && F({ dir: "H", w: 18, align: "center" }, [it.checked ? I("check", 16, "text-brand") : R({ w: 16, h: 16, name: "Empty" })]),
      it.icon && I(it.icon, 18, it.danger ? "text-error" : "text-tertiary"),
      T(it.label, { style: "Text sm/Medium", color: fg, grow: true }),
      it.shortcut && T(it.shortcut, { style: "Text xs/Regular", color: "text-quaternary", ltr: true }),
      it.sub && I("chevron-left", 16, "text-quaternary"),
    ]);
  }));
}

function buildNavigation() {
  const root = kitPage("🧭", "Navigation", "ناوبری", "تب، مسیر صفحه، صفحه‌بندی، مراحل، منوی کناری، منوی کشویی و جستجوی فرمان (⌘K).");

  safe("Tabs", () => section(root, "Tabs · تب", "سه سبک خطی، قرصی و بخش‌بندی؛ افقی یا عمودی.", (h) => {
    const labels = ["نمای کلی", "تراکنش‌ها", "گزارش‌ها", "تنظیمات"];
    componentSet(h, "Tabs", {
      axes: { Variant: ["Line", "Pill", "Segmented"], Orientation: ["Horizontal", "Vertical"] },
      build: (p) => {
        const vertical = p.Orientation === "Vertical";
        const tab = (label, i) => {
          const on = i === 0;
          if (p.Variant === "Line") {
            return F({ name: "Tab", dir: vertical ? "H" : "V", gap: 0, h: vertical ? 40 : undefined, w: vertical ? "fill" : undefined, cross: vertical ? "center" : "center", align: vertical ? "between" : "start" }, vertical
              ? [F({ dir: "H", gap: "space/2", ps: "space/3", cross: "center", grow: true }, [T(label, { style: "Text sm/Semibold", color: on ? "text-primary" : "text-tertiary", name: "Label" })]), R({ w: 2, h: 40, fill: on ? "border-brand" : "border-secondary", name: "Indicator" })]
              : [F({ dir: "H", gap: "space/2", h: 38, px: "space/1", cross: "center", css: on ? undefined : "k-tabs__tab", cssCheck: ["padx", "gap"] }, [T(label, { style: "Text sm/Semibold", color: on ? "text-primary" : "text-tertiary", name: "Label" }), i === 1 && badge({ tone: on ? "Brand" : "Neutral", size: "sm", label: "۱۲", dot: false })]), R({ w: 10, h: 2, radius: 2, fill: on ? "border-brand" : undefined, fillW: true, name: "Indicator", css: on ? "k-tabs__indicator" : undefined, cssCheck: ["bg", "h"] })]);
          }
          // سگمنت: حداقل ۳۶ پیکسل، تب انتخاب‌شده روی bg-elevated با سایهٔ sm و خط روشن
          return F({ name: "Tab", dir: "H", gap: "space/2", h: p.Variant === "Segmented" ? 36 : "tab/height", px: "space/3", w: vertical ? "fill" : undefined, cross: "center", radius: "radius/md", fill: on ? (p.Variant === "Pill" ? "bg-brand-subtle" : "bg-elevated") : undefined, shadow: on && p.Variant === "Segmented" ? ["Shadow/sm", "highlight-only"] : undefined }, [
            T(label, { style: "Text sm/Semibold", color: on ? (p.Variant === "Pill" ? "text-brand" : "text-primary") : "text-tertiary", name: "Label" }),
          ]);
        };
        const list = F({
          name: "Tab list", dir: vertical ? "V" : "H", gap: p.Variant === "Line" ? (vertical ? 0 : "space/4") : "space/1", w: vertical ? 200 : undefined,
          p: p.Variant === "Segmented" ? 3 : undefined, radius: p.Variant === "Segmented" ? 11 : undefined,
          fill: p.Variant === "Segmented" ? "bg-secondary" : undefined, stroke: p.Variant === "Segmented" ? "border-secondary" : p.Variant === "Line" && !vertical ? "border-secondary" : undefined,
          sides: p.Variant === "Line" && !vertical ? [0, 0, 1, 0] : undefined,
          css: p.Variant === "Segmented" && !vertical ? "k-tabs--segmented .k-tabs__list" : undefined, cssCheck: ["pad", "radius", "bg", "border"],
        }, labels.map(tab));
        return list;
      },
      cols: 2,
      docs: "tabs",
    });
  }));

  safe("Breadcrumb", () => section(root, "Breadcrumb · مسیر صفحه", "با آیکون خانه، جداکنندهٔ فلش یا اسلش و جمع شدن مسیرهای طولانی.", (h) => {
    componentSet(h, "Breadcrumb", {
      axes: { Separator: ["Chevron", "Slash"], Collapsed: ["No", "Yes"] },
      build: (p) => {
        const items = p.Collapsed === "Yes" ? ["خانه", "…", "کفش", "کتانی دویدن"] : ["خانه", "فروشگاه", "کفش", "کتانی دویدن"];
        const kids = [];
        items.forEach((label, i) => {
          if (i) kids.push(p.Separator === "Slash" ? T("/", { style: "Text md/Regular", color: "border-primary" }) : I("chevron-left", 16, "border-primary"));
          const last = i === items.length - 1;
          // k-breadcrumb__link: ۴/۸ (آیکون ۴/۶)، گوشهٔ ۸، متن Semibold؛ صفحهٔ فعلی bg-active
          kids.push(F({ name: "Crumb", dir: "H", gap: "space/1.5", px: i === 0 ? 6 : 8, py: 4, h: 28, cross: "center", radius: "radius/md", fill: last ? "bg-active" : undefined,
            css: last ? undefined : i === 0 ? "k-breadcrumb__link k-breadcrumb__link--icon" : "k-breadcrumb__link", cssCheck: ["pad", "radius", "gap", "bg", "h"] }, [
            i === 0 ? I("home", 18, "text-tertiary") : T(label, { style: "Tight sm/Semibold", color: last ? "text-primary" : "text-tertiary", css: last ? undefined : "k-breadcrumb__text" }),
          ]));
        });
        return F({ name: "Breadcrumb", dir: "H", gap: "space/1", cross: "center" }, kids);
      },
      docs: "breadcrumb",
    });
  }));

  safe("Pagination", () => section(root, "Pagination · صفحه‌بندی", "صفحه‌های کوتاه‌شده با «…»، دکمه‌های قبلی و بعدی و ابزار پرش به صفحه.", (h) => {
    componentSet(h, "Pagination", {
      axes: { Type: ["Default", "Compact", "With tools"] },
      build: (p) => {
        const page = (n, cur) => F({ name: "Page", dir: "H", w: 40, h: 40, px: n === "…" ? 0 : 8, align: "center", cross: "center", radius: "radius/md", fill: cur ? "bg-active" : undefined, css: cur || n === "…" ? undefined : "k-pagination__page", cssCheck: ["padx", "radius", "bg"] }, [T(n, { style: cur ? "Text sm/Semibold" : "Text sm/Medium", color: cur ? "text-primary" : n === "…" ? "text-quaternary" : "text-tertiary", align: "center" })]);
        if (p.Type === "Compact") return F({ name: "Pagination", dir: "H", gap: "space/3", cross: "center" }, [button({ variant: "Secondary", size: "sm", iconOnly: "arrow-right" }), T("صفحهٔ ۳ از ۱۰", { style: "Text sm/Medium", color: "text-secondary" }), button({ variant: "Secondary", size: "sm", iconOnly: "arrow-left" })]);
        const row = F({ name: "Pagination", dir: "H", gap: "space/3", w: 720, align: "between", cross: "center" }, [
          button({ variant: "Secondary", size: "sm", label: "قبلی", iconStart: "arrow-right" }),
          F({ name: "Pages", dir: "H", gap: 2 }, [page("۱"), page("۲"), page("۳", true), page("…"), page("۸"), page("۹"), page("۱۰")]),
          button({ variant: "Secondary", size: "sm", label: "بعدی", iconEnd: "arrow-left" }),
        ]);
        if (p.Type === "Default") return row;
        return F({ name: "Pagination", dir: "V", gap: "space/3", w: 720 }, [
          row,
          F({ name: "Tools", dir: "H", gap: "space/4", w: "fill", cross: "center", pt: "space/3", stroke: "border-secondary", sides: [1, 0, 0, 0], css: "k-pagination__tools", cssCheck: ["pad", "gap", "border"] }, [
            F({ dir: "H", gap: "space/2", cross: "center" }, [T("نمایش", { style: "Text sm/Regular", color: "text-tertiary" }), inputBox({ size: "sm", text: "۲۰", w: 80, end: [I("chevron-down", 16, "text-tertiary")] }), T("در هر صفحه", { style: "Text sm/Regular", color: "text-tertiary" })]),
            F({ dir: "H", gap: "space/2", cross: "center" }, [T("برو به صفحه", { style: "Text sm/Regular", color: "text-tertiary" }), inputBox({ size: "sm", text: "۳", w: 72 })]),
            Spacer(),
            T("۴۱ تا ۶۰ از ۱۹۸ مورد", { style: "Text sm/Regular", color: "text-tertiary" }),
          ]),
        ]);
      },
      cols: 1,
      docs: "pagination",
    });
  }));

  safe("Stepper", () => section(root, "Stepper · مراحل", "مراحل افقی یا عمودی با وضعیت تمام‌شده، فعلی و آینده.", (h) => {
    const steps = [["اطلاعات حساب", "نام و ایمیل"], ["آدرس", "محل تحویل"], ["پرداخت", "درگاه بانکی"], ["تأیید", "بازبینی سفارش"]];
    // k-steps__marker: ۳۲ پیکسل با حاشیهٔ ۲؛ مرحلهٔ تمام‌شده تیک، فعلی شماره با حلقهٔ برند، بعدی شمارهٔ کم‌رنگ
    const marker = (i, cur) => {
      const done = i < cur, now = i === cur;
      return F({ name: "Marker", dir: "H", w: 32, h: 32, align: "center", cross: "center", radius: "radius/full", fill: done ? "bg-brand" : "bg-primary", stroke: done ? "bg-brand" : now ? "border-brand" : "border-secondary", sw: 2, shadow: now ? "Focus ring/brand" : undefined,
        css: done ? "k-steps__marker" : undefined, cssCheck: ["radius", "bg", "border", "h", "w"] }, [
        done ? I("check", 16, "text-on-brand") : T(fa(i + 1), { style: "Text sm/Semibold", color: now ? "text-brand" : "text-tertiary", align: "center" }),
      ]);
    };
    componentSet(h, "Stepper", {
      axes: { Orientation: ["Horizontal", "Vertical"], Current: ["1", "2", "3", "4"] },
      build: (p) => {
        const cur = Number(p.Current) - 1;
        if (p.Orientation === "Horizontal") {
          return F({ name: "Stepper", dir: "H", gap: 0, w: 720, cross: "start" }, steps.map(([t, d], i) =>
            F({ name: "Step", dir: "V", gap: "space/2", grow: true, cross: "center" }, [
              F({ dir: "H", gap: 0, w: "fill", cross: "center" }, [
                R({ w: 10, h: 2, fill: i === 0 ? undefined : i <= cur ? "bg-brand" : "border-secondary", grow: true, name: "Line" }),
                marker(i, cur),
                R({ w: 10, h: 2, fill: i === steps.length - 1 ? undefined : i < cur ? "bg-brand" : "border-secondary", grow: true, name: "Line" }),
              ]),
              T(t, { style: "Text sm/Semibold", color: i === cur ? "text-brand" : i > cur ? "text-tertiary" : "text-secondary", align: "center", css: i < cur ? "k-steps__title" : undefined }),
              T(d, { style: "Text xs/Regular", color: "text-tertiary", align: "center", css: "k-steps__description" }),
            ]),
          ));
        }
        return F({ name: "Stepper", dir: "V", gap: 0, w: 280 }, steps.map(([t, d], i) =>
          F({ name: "Step", dir: "H", gap: "space/3", w: "fill", cross: "start" }, [
            F({ dir: "V", gap: 4, cross: "center" }, [marker(i, cur), i < steps.length - 1 && R({ w: 2, h: 28, radius: 1, fill: i < cur ? "bg-brand" : "border-secondary", name: "Line" })]),
            F({ dir: "V", gap: 0, pt: 4 }, [T(t, { style: "Text sm/Semibold", color: i === cur ? "text-brand" : i > cur ? "text-tertiary" : "text-secondary" }), T(d, { style: "Text xs/Regular", color: "text-tertiary" })]),
          ]),
        ));
      },
      cols: 4,
      docs: "stepper",
    });
  }));

  safe("SideNav", () => section(root, "Side nav · منوی کناری", "گروه‌بندی، نشان شمارش، زیرمنو و حالت جمع‌شده.", (h) => {
    componentSet(h, "Side nav", {
      axes: { State: ["Expanded", "Collapsed"] },
      build: (p) => {
        const collapsed = p.State === "Collapsed";
        const items = [["home", "داشبورد", true], ["chart", "گزارش‌ها"], ["users", "مشتریان", false, "۱۲"], ["credit-card", "پرداخت‌ها"], ["folder", "پروژه‌ها"], ["settings", "تنظیمات"]];
        const item = ([icon, label, on, count]) => F({ name: "Nav item", dir: "H", gap: "space/3", h: 40, px: collapsed ? 0 : "space/3", w: collapsed ? 40 : "fill", align: collapsed ? "center" : "start", cross: "center", radius: "radius/md", fill: on ? "bg-active" : undefined,
          css: on && !collapsed ? "k-sidenav__item" : undefined, cssCheck: ["padx", "radius", "gap", "bg", "h"] }, [
          I(icon, 20, on ? "text-primary" : "text-tertiary"),
          !collapsed && T(label, { style: "Text sm/Semibold", color: on ? "text-primary" : "text-secondary", grow: true }),
          !collapsed && count && badge({ tone: "Neutral", size: "sm", label: count, dot: false }),
        ]);
        return F({ name: "Side nav", dir: "V", gap: "space/6", p: "space/4", w: collapsed ? 72 : 280, h: 640, cross: collapsed ? "center" : "start", fill: "bg-secondary", stroke: "border-secondary", sides: [0, 0, 0, 1] }, [
          F({ name: "Logo", dir: "H", gap: "space/2", cross: "center", w: collapsed ? undefined : "fill" }, [
            F({ dir: "H", w: 32, h: 32, align: "center", cross: "center", radius: "radius/md", fill: "bg-brand" }, [T("ک", { style: "Text md/Bold", color: "text-on-brand" })]),
            !collapsed && T("کاشی", { style: "Text lg/Bold", color: "text-primary" }),
          ]),
          !collapsed && inputBox({ size: "sm", iconStart: "search", placeholder: "جستجو", end: [T("⌘K", { style: "Text xs/Medium", color: "text-quaternary", ltr: true })] }),
          F({ name: "Items", dir: "V", gap: 2, w: collapsed ? undefined : "fill", cross: collapsed ? "center" : "start" }, items.map(item)),
          F({ name: "Spacer", dir: "V", grow: true, w: 1 }),
          collapsed ? avatar({ size: "md", status: "Online" }) : F({ name: "Account", dir: "H", gap: "space/3", w: "fill", pt: "space/4", cross: "center", stroke: "border-secondary", sides: [1, 0, 0, 0] }, [
            avatar({ size: "md", status: "Online" }),
            F({ dir: "V", gap: 0, grow: true }, [T("سپنتا پویا", { style: "Text sm/Semibold", color: "text-primary" }), T("sepanta@kashi.ir", { style: "Text sm/Regular", color: "text-tertiary", ltr: true })]),
            I("logout", 18, "text-quaternary"),
          ]),
        ]);
      },
      docs: "side-nav",
    });
  }));

  safe("Menu", () => section(root, "Dropdown menu · منوی کشویی", "با میانبر، گزینهٔ تیک‌دار، زیرمنو و گزینهٔ خطرناک.", (h) => {
    componentSet(h, "Dropdown menu", {
      axes: { Type: ["Actions", "Checkable"] },
      build: (p) => p.Type === "Actions"
        ? menuPanel([{ icon: "edit", label: "ویرایش", shortcut: "⌘E", active: true }, { icon: "copy", label: "کپی", shortcut: "⌘D" }, { icon: "link", label: "کپی لینک" }, { icon: "send", label: "انتقال به…", sub: true }, "-", { icon: "trash", label: "حذف", danger: true, shortcut: "⌫" }])
        : menuPanel([{ heading: true, label: "نمایش ستون‌ها" }, { label: "نام", checked: true }, { label: "وضعیت", checked: true }, { label: "مبلغ", checked: false, active: true }, { label: "تاریخ", checked: true }]),
      docs: "dropdown-menu",
    });
    componentSet(h, "Menu button", {
      axes: { State: ["Closed", "Open"] },
      build: (p) => F({ name: "Menu button", dir: "V", gap: "space/2", cross: "start" }, [
        button({ variant: "Secondary", label: "گزینه‌ها", iconEnd: "chevron-down", state: p.State === "Open" ? "Focus" : "Default" }),
        p.State === "Open" && menuPanel([{ icon: "edit", label: "ویرایش", active: true }, { icon: "copy", label: "کپی" }, "-", { icon: "trash", label: "حذف", danger: true }], { w: 200 }),
      ]),
      docs: "dropdown-menu",
    });
  }));

  safe("Command", () => section(root, "Command palette · جستجوی فرمان", "با ⌘K باز می‌شود؛ جستجوی فارسی و پیمایش کامل با کیبورد.", (h) => {
    componentSet(h, "Command palette", {
      build: () => F({ name: "Command palette", dir: "V", gap: 0, w: 560, radius: "radius/xl", fill: "bg-elevated", stroke: "border-secondary", shadow: "Popover", clip: true }, [
        F({ name: "Search", dir: "H", gap: "space/3", px: "space/4", h: 56, w: "fill", cross: "center", stroke: "border-secondary", sides: [0, 0, 1, 0] }, [
          I("search", 20, "text-tertiary"),
          T("گزا", { style: "Text md/Regular", color: "text-primary", grow: true, name: "Query" }),
          F({ dir: "H", h: 22, px: 6, cross: "center", radius: "radius/sm", stroke: "border-primary" }, [T("Esc", { style: "Text xs/Medium", color: "text-tertiary", ltr: true })]),
        ]),
        F({ name: "Results", dir: "V", gap: 1, p: "space/2", w: "fill" }, [
          F({ dir: "H", px: 10, pt: "space/2", pb: "space/1", w: "fill" }, [T("صفحه‌ها", { style: "Text xs/Medium", color: "text-tertiary" })]),
          ...[["chart", "گزارش فروش", "صفحه", true], ["chart", "گزارش مالیات", "صفحه"], ["file", "گزارش هفتگی.pdf", "فایل"]].map(([icon, label, kind, on]) =>
            F({ name: "Result", dir: "H", gap: "space/3", h: 44, px: 10, w: "fill", cross: "center", radius: "radius/md", fill: on ? "bg-hover" : undefined }, [
              I(icon, 18, on ? "text-brand" : "text-tertiary"),
              T(label, { style: "Text sm/Medium", color: "text-secondary", grow: true, highlight: [0, 3] }),
              T(kind, { style: "Text xs/Regular", color: "text-quaternary" }),
              on && I("arrow-left", 16, "text-tertiary"),
            ]),
          ),
          F({ dir: "H", px: 10, pt: "space/3", pb: "space/1", w: "fill" }, [T("فرمان‌ها", { style: "Text xs/Medium", color: "text-tertiary" })]),
          F({ name: "Result", dir: "H", gap: "space/3", h: 44, px: 10, w: "fill", cross: "center", radius: "radius/md" }, [I("plus", 18, "text-tertiary"), T("ساخت گزارش جدید", { style: "Text sm/Medium", color: "text-secondary", grow: true }), T("⌘N", { style: "Text xs/Regular", color: "text-quaternary", ltr: true })]),
        ]),
        F({ name: "Footer", dir: "H", gap: "space/4", px: "space/4", h: 40, w: "fill", cross: "center", fill: "bg-secondary", stroke: "border-secondary", sides: [1, 0, 0, 0] }, [
          T("↑↓ حرکت", { style: "Text xs/Regular", color: "text-tertiary" }), T("↵ انتخاب", { style: "Text xs/Regular", color: "text-tertiary" }), T("Esc بستن", { style: "Text xs/Regular", color: "text-tertiary" }),
        ]),
      ]),
      docs: "command-palette",
    });
  }));

  safe("Context", () => section(root, "Context menu · منوی راست‌کلیک", "منوی کلیک راست روی یک ناحیه.", (h) => {
    componentSet(h, "Context menu", {
      build: () => menuPanel([{ icon: "copy", label: "کپی", shortcut: "⌘C", active: true }, { icon: "edit", label: "تغییر نام", shortcut: "F2" }, { icon: "download", label: "دانلود" }, "-", { icon: "trash", label: "انتقال به سطل زباله", danger: true }], { w: 220 }),
      docs: "context-menu",
    });
  }));

  safe("Splitter", () => section(root, "Splitter · تقسیم‌کننده", "دو پنل با دستگیرهٔ قابل کشیدن (با کیبورد هم).", (h) => {
    componentSet(h, "Splitter", {
      axes: { Orientation: ["Horizontal", "Vertical"] },
      build: (p) => {
        const hz = p.Orientation === "Horizontal";
        // k-splitter: خط ۱ پیکسلی با دستگیرهٔ ۶×۳۲ وسط آن
        const pane = (label) => F({ name: "Pane", dir: "V", grow: true, p: "space/2", align: "center", cross: "center", w: hz ? undefined : "fill", h: hz ? "fill" : undefined, css: "k-splitter__pane", cssCheck: ["pad"] }, [T(label, { style: "Text sm/Medium", color: "text-tertiary" })]);
        const handle = F({ name: "Handle", dir: hz ? "V" : "H", w: hz ? 1 : "fill", h: hz ? "fill" : 1, align: "center", cross: "center", fill: "border-secondary", css: "k-splitter__handle", cssCheck: ["bg"] }, [
          R({ w: hz ? 6 : 32, h: hz ? 32 : 6, radius: "radius/full", fill: "bg-elevated", stroke: "border-primary", name: "Grip" }),
        ]);
        return F({ name: "Splitter", dir: hz ? "H" : "V", gap: 0, w: 480, h: 220, radius: "radius/xl", stroke: "border-secondary", clip: true, css: "k-splitter" }, [pane("فهرست"), handle, pane("جزئیات")]);
      },
      docs: "splitter",
    });
  }));
}
