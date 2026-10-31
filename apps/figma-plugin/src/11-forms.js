// فرم‌ها: فیلد، انتخاب، چک‌باکس، سوییچ، اسلایدر، تقویم و ...

const FIELD_W = 320;

/** کادر فیلد ورودی */
function inputBox({ size = "md", state = "Default", text = "", placeholder = "متن را وارد کنید", iconStart, end = [], start = [], w = "fill", h, ltr, name = "Input" } = {}) {
  const disabled = state === "Disabled";
  const error = state === "Error";
  const focus = state === "Focus";
  const stroke = disabled ? "border-secondary" : focus ? "border-brand" : error ? "border-error" : state === "Hover" ? "text-quaternary" : "border-input";
  const shadow = focus ? (error ? "Input error focus" : "Input focus") : "Shadow/xs";
  const valueColor = disabled ? "text-quaternary" : text ? "text-primary" : "text-quaternary";
  const kids = [];
  if (iconStart) kids.push(I(iconStart, 20, "text-quaternary"));
  kids.push(...start);
  kids.push(T(text || placeholder, { style: "Text md/Regular", color: valueColor, name: "Value", grow: true, ltr, w: "fill", maxLines: 1, css: "k-input__control", cssCheck: ["font"] }));
  kids.push(...end);
  const plain = state === "Default" && !h;
  return F({
    name, dir: "H", gap: "space/2", px: "input/padding", h: h || `input/height/${size}`, w, cross: "center",
    radius: "radius/md", fill: disabled ? "bg-secondary" : "bg-primary", stroke, shadow,
    css: plain && size !== "lg" ? (size === "sm" ? "k-input k-input--sm" : "k-input") : undefined, cssCheck: ["padx", "radius", "gap", "bg", "border", "h"],
  }, kids);
}

/** برچسب، کنترل و متن راهنما */
function field({ label = "برچسب", hint, error, optional, required, control, w = FIELD_W, labelEnd }) {
  // برچسب و راهنما در CSS خط ۱٫۳۵ دارند (k-label، k-hint)
  const labelRow = F({ name: "Label row", dir: "H", gap: "space/3", w: "fill", cross: "center", css: "k-field__label-row", cssCheck: ["gap"] }, [
    F({ name: "Label group", dir: "H", gap: "space/1", cross: "center" }, [
      T(label, { style: "Tight sm/Medium", color: "text-secondary", name: "Label", css: "k-label" }),
      required && T("*", { style: "Tight sm/Medium", color: "text-error", name: "Required", css: "k-label__required" }),
      optional && T("اختیاری", { style: "Tight sm/Regular", color: "text-tertiary", name: "Optional", css: "k-label__optional" }),
    ]),
    labelEnd && Spacer(),
    labelEnd,
  ]);
  const hintNode = (hint || error) && F({ name: "Hint row", dir: "H", gap: "space/3", w: "fill", cross: "start", css: "k-field__hint-row", cssCheck: ["gap"] }, [
    T(error || hint, { style: "Tight sm/Regular", color: error ? "text-error" : "text-tertiary", name: "Hint", grow: true, w: "fill", css: error ? "k-hint k-hint--error" : "k-hint" }),
  ]);
  return F({ name: "Field", dir: "V", gap: "space/1.5", w, css: "k-field", cssCheck: ["gap"] }, [labelRow, control, hintNode]);
}

/** پنل فهرست کشویی (Listbox / Menu) */
function listbox(items, { w = FIELD_W, active = 1, selected = 0, query } = {}) {
  return F({ name: "Listbox", dir: "V", gap: 0, p: "space/1.5", w, radius: "radius/lg", fill: "bg-elevated", stroke: "border-secondary", shadow: "Popover" },
    items.map((it, i) => {
      const o = typeof it === "string" ? { label: it } : it;
      if (o.group) return T(o.group, { style: "Text xs/Semibold", color: "text-tertiary", name: "Group", w: "fill" });
      const on = i === selected;
      // گزینهٔ دوخطی ارتفاع ثابت ندارد تا متن‌ها روی هم نیفتند
      // k-option: حداقل ۴۰ پیکسل؛ گزینهٔ دوخطی بلندتر می‌شود
      return F({ name: "Option", dir: "H", gap: "space/2", h: o.description ? undefined : 40, minH: 40, py: o.description ? 6 : undefined, px: 10, w: "fill", cross: "center", radius: "radius/md", fill: i === active ? "bg-hover" : undefined, css: i === active && !o.description ? "k-option" : undefined, cssCheck: ["padx", "radius", "gap", "bg", "h"] }, [
        o.icon && I(o.icon, 18, "text-tertiary"),
        o.logo && bankLogo(o.logo, 20),
        F({ name: "Body", dir: "V", gap: 0, grow: true }, [
          // بخش منطبق در همان یک متن رنگی می‌شود تا اتصال حروف فارسی نشکند
          T(o.label, { style: on ? "Text sm/Semibold" : "Text sm/Regular", color: o.disabled ? "text-quaternary" : on || i === active ? "text-primary" : "text-secondary", name: "Label", highlight: query && o.label.includes(query) ? [o.label.indexOf(query), o.label.indexOf(query) + query.length] : undefined }),
          o.description && T(o.description, { style: "Text xs/Regular", color: "text-tertiary", css: "k-option__desc" }),
        ]),
        o.shortcut && T(o.shortcut, { style: "Text xs/Regular", color: "text-quaternary", ltr: true }),
        on && I("check", 16, "text-brand"),
      ]);
    }));
}

/** برچسب داخل TagInput و MultiSelect؛ در React همان Badge قابل حذف است */
function tag(label, { tone = "Neutral" } = {}) {
  return badge({ tone, label, dot: false, removable: true });
}

/** کادر چندبرچسبی (k-tag-input) */
function tagBox({ state = "Default", tags = [], placeholder = "", end = [] }) {
  const focus = state === "Focus";
  return F({ name: "Tag input", dir: "H", wrap: true, gap: "space/1.5", rowGap: "space/1.5", py: 6, px: 10, w: "fill", minH: 40, cross: "center",
    radius: "radius/md", fill: "bg-primary", stroke: focus ? "border-brand" : "border-input", shadow: focus ? "Input focus" : "Shadow/xs",
    css: focus ? undefined : "k-tag-input" }, [
    ...tags,
    F({ name: "Control", dir: "H", p: 4, grow: true, cross: "center", css: "k-tag-input__control", cssCheck: ["pad"] }, [T(placeholder || " ", { style: "Text md/Regular", color: "text-quaternary", name: "Placeholder" })]),
    ...end,
  ]);
}

function checkMark(kind, { checked, state = "Default", size = 18 }) {
  const disabled = state === "Disabled";
  const on = checked && checked !== "Off";
  const isRadio = kind === "radio";
  const fill = disabled ? "bg-tertiary" : on ? (state === "Hover" ? "bg-brand-hover" : "bg-brand") : "bg-elevated";
  const stroke = disabled ? "border-secondary" : on ? fill : state === "Hover" ? "border-brand" : "border-input";
  // در CSS چک‌باکس و رادیو سایهٔ xs دارند؛ در فوکوس حلقهٔ برند هم اضافه می‌شود
  const shadow = state === "Focus" ? "Input focus" : disabled ? undefined : "Shadow/xs";
  const box = F({ name: isRadio ? "Radio" : "Checkbox", dir: "H", w: size, h: size, align: "center", cross: "center", radius: isRadio ? "radius/full" : "radius/checkbox", fill, stroke, shadow,
    css: on && state === "Default" && checked !== "Indeterminate" ? (isRadio ? "k-radio" : size === 20 ? "k-checkbox k-checkbox--lg" : "k-checkbox") : undefined, cssCheck: ["radius", "bg", "border", "h", "w"] }, [
    on && (isRadio
      ? R({ ellipse: true, w: size * 0.4, h: size * 0.4, fill: disabled ? "text-quaternary" : "text-on-brand", name: "Dot" })
      : checked === "Indeterminate"
        ? R({ w: size * 0.55, h: 2, radius: 1, fill: disabled ? "text-quaternary" : "text-on-brand", name: "Dash" })
        : I("check", size * 0.8, disabled ? "text-quaternary" : "text-on-brand")),
  ]);
  return box;
}

function switchTrack({ checked, state = "Default", size = "md" }) {
  const [w, h] = { sm: [28, 16], md: [36, 20], lg: [44, 24] }[size];
  const on = checked === "On";
  const disabled = state === "Disabled";
  const track = disabled ? "bg-tertiary" : on ? (state === "Hover" ? "bg-brand-hover" : "bg-brand") : state === "Hover" ? "text-quaternary" : "border-input";
  return F({ name: "Switch", dir: "H", w, h, p: 2, cross: "center", align: on ? "end" : "start", radius: "radius/full", fill: track, shadow: state === "Focus" ? "Focus ring/brand" : undefined,
    css: on && state === "Default" ? ({ sm: "k-switch k-switch--sm", md: "k-switch", lg: "k-switch k-switch--lg" })[size] : undefined, cssCheck: ["pad", "radius", "bg", "h", "w"] }, [
    R({ ellipse: true, w: h - 4, h: h - 4, fill: disabled ? "bg-secondary" : "#ffffff", shadow: "Shadow/sm", name: "Thumb" }),
  ]);
}

function checkRow(control, { label = "مرا به خاطر بسپار", description = "تا ۳۰ روز وارد حساب بمانید.", disabled } = {}) {
  // k-check: متن با خط ثابت ۲۰ پیکسل و کنترل وسط خط اول
  return F({ name: "Check", dir: "H", gap: "space/2", cross: "start", css: "k-check", cssCheck: ["gap"] }, [
    F({ name: "Control wrap", dir: "H", h: 20, cross: "center" }, [control]),
    F({ name: "Text", dir: "V", gap: 2, css: "k-check__text", cssCheck: ["gap"] }, [
      T(label, { style: "Control sm/Medium", color: disabled ? "text-quaternary" : "text-secondary", name: "Label", css: disabled ? undefined : "k-check__label" }),
      T(description, { style: "Control sm/Regular", color: "text-tertiary", name: "Description", css: "k-check__description" }),
    ]),
  ]);
}

function jalaliGrid({ range, selected = 6, w = 300 } = {}) {
  const C = TOKENS.calendar;
  // k-calendar__day: ۴۰ پیکسل، خانهٔ جدول با ۱ پیکسل فاصله
  const cell = 42;
  const cells = [];
  const lead = C.firstWeekday;
  for (let i = 0; i < lead; i++) cells.push({ day: C.prevLength - lead + 1 + i, out: true });
  for (let d = 1; d <= C.length; d++) cells.push({ day: d });
  while (cells.length % 7) cells.push({ day: cells.length - lead - C.length + 1, out: true });
  const rows = [];
  for (let r = 0; r < cells.length / 7; r++) {
    rows.push(F({ name: "Week", dir: "H", gap: 0 }, cells.slice(r * 7, r * 7 + 7).map((c, i) => {
      const inRange = range && !c.out && c.day >= range[0] && c.day <= range[1];
      const edge = range ? !c.out && (c.day === range[0] || c.day === range[1]) : !c.out && c.day === selected;
      const holiday = !c.out && C.holidays.includes(c.day);
      const today = !c.out && c.day === 6;
      return F({ name: "Day", dir: "H", w: cell, h: cell, align: "center", cross: "center", fill: inRange ? "bg-brand-subtle" : undefined, radius: range && edge ? (c.day === range[0] ? ["radius/full", 0, 0, "radius/full"] : [0, "radius/full", "radius/full", 0]) : undefined }, [
        F({ name: "Cell", dir: "V", w: 40, h: 40, align: "center", cross: "center", radius: "radius/full", fill: edge ? "bg-brand" : undefined, shadow: edge ? "Button" : undefined }, [
          T(fa(c.day), { style: edge ? "Text sm/Semibold" : today ? "Text sm/Bold" : "Text sm/Regular", color: edge ? "text-on-brand" : c.out ? "text-quaternary" : today ? "text-brand" : holiday ? "text-error" : inRange ? "text-primary" : "text-secondary", align: "center" }),
          // امروز: نقطهٔ ۴ پیکسلی زیر عدد
          today && !edge && R({ ellipse: true, w: 4, h: 4, fill: "text-brand", name: "Today dot", absolute: true, x: 18, y: 31 }),
        ]),
      ]);
    })));
  }
  const select = (label) => F({ name: "Select", dir: "H", gap: "space/1", h: 36, ps: "space/3", pe: "space/1.5", cross: "center", radius: "radius/md" }, [
    T(label, { style: "Text sm/Semibold", color: "text-primary" }),
    I("chevron-down", 16, "text-quaternary"),
  ]);
  // همان ساختار k-datepicker__popover و k-calendar در React
  return F({ name: "Calendar", dir: "V", gap: "space/2", p: "space/4", radius: "radius/xl", fill: "bg-elevated", stroke: "border-secondary", shadow: "Popover" }, [
    F({ name: "Header", dir: "H", gap: "space/2", w: "fill", align: "between", cross: "center" }, [
      button({ variant: "Tertiary", size: "sm", iconOnly: "chevron-right" }),
      F({ name: "Selects", dir: "H", gap: "space/1" }, [select(C.months[C.month - 1]), select(fa(C.year))]),
      button({ variant: "Tertiary", size: "sm", iconOnly: "chevron-left" }),
    ]),
    F({ name: "Grid", dir: "V", gap: 0 }, [
      F({ name: "Weekdays", dir: "H", gap: 0 }, C.weekdays.map((d, i) =>
        F({ dir: "H", w: cell, h: 32, align: "center", cross: "center" }, [T(d, { style: "Text xs/Medium", color: i === 6 ? "text-error" : "text-tertiary", align: "center" })]),
      )),
      F({ name: "Days", dir: "V", gap: 0 }, rows),
    ]),
    F({ name: "Footer", dir: "H", w: "fill", align: "center", pt: "space/2", stroke: "border-secondary", sides: [1, 0, 0, 0] }, [
      button({ variant: "Link", label: "امروز" }),
    ]),
  ]);
}

function buildForms() {
  const root = kitPage("📝", "Forms", "فرم‌ها", "فیلدها با برچسب، راهنما و پیام خطا؛ حاشیهٔ فیلدها کنتراست ۳:۱ دارد (WCAG 1.4.11) و حلقهٔ فوکوس همیشه دیده می‌شود.");

  safe("Input", () => section(root, "Input · فیلد متنی", "سه اندازه، پنج حالت. برچسب، راهنما و متن داخل فیلد از پنل ویژگی‌ها عوض می‌شوند.", (h) => {
    componentSet(h, "Input", {
      axes: { Size: ["sm", "md", "lg"], State: ["Default", "Hover", "Focus", "Error", "Disabled"], Content: ["Placeholder", "Filled"] },
      build: (p) => {
        const node = field({
          label: "ایمیل",
          hint: p.State === "Error" ? undefined : "ایمیل کاری خود را وارد کنید.",
          error: p.State === "Error" ? "ایمیل وارد شده معتبر نیست." : undefined,
          control: inputBox({ size: p.Size, state: p.State, iconStart: "mail", text: p.Content === "Filled" ? "sepanta@kashi.ir" : "", placeholder: "name@example.com", ltr: true }),
        });
        node.findOne((n) => n.name === "Icon start" || n.name === "mail").name = "Icon start";
        return node;
      },
      text: { Label: ["Label", "ایمیل"], Hint: ["Hint", "ایمیل کاری خود را وارد کنید."], Value: ["Value", "name@example.com"] },
      bools: { "Show label": ["Label row", true], "Show hint": ["Hint row", true], "Icon start": ["Icon start", true] },
      cols: 6,
      docs: "input",
    });
  }));

  safe("InputVariants", () => section(root, "Input types · انواع فیلد", "رمز عبور با دکمهٔ نمایش، جستجو با پاک کردن، فیلد با پیشوند و شمارندهٔ نویسه.", (h) => {
    componentSet(h, "Input type", {
      axes: { Type: ["Password", "Search", "URL", "Loading", "Counter"] },
      build: (p) => {
        if (p.Type === "Password") return field({ label: "رمز عبور", labelEnd: T("فراموشی رمز؟", { style: "Text sm/Semibold", color: "text-brand" }), control: inputBox({ text: "••••••••••", end: [I("eye", 20, "text-tertiary")] }) });
        if (p.Type === "Search") return field({ label: "جستجو", control: inputBox({ iconStart: "search", text: "کاشی", end: [I("close", 18, "text-quaternary"), F({ dir: "H", px: 6, h: 22, cross: "center", radius: "radius/sm", stroke: "border-primary" }, [T("⌘K", { style: "Text xs/Medium", color: "text-tertiary", ltr: true })])] }) });
        // آدرس چپ‌به‌راست است: پیشوند سمت چپ، داخل همان یک کادر با خط جداکننده
        if (p.Type === "URL") return field({ label: "وب‌سایت", control: F({ name: "Input", dir: "H", gap: 0, w: "fill", h: "input/height/md", cross: "center", radius: "radius/md", fill: "bg-primary", stroke: "border-input", shadow: "Shadow/xs", clip: true }, [
          F({ name: "Value wrap", dir: "H", px: "input/padding", h: "fill", grow: true, cross: "center" }, [T("kashi.ir", { style: "Text md/Regular", color: "text-primary", ltr: true, name: "Value", w: "fill" })]),
          F({ name: "Prefix", dir: "H", px: "space/3", h: "fill", cross: "center", fill: "bg-secondary", stroke: "border-input", sides: [0, 1, 0, 0] }, [T("https://", { style: "Text md/Regular", color: "text-tertiary", ltr: true })]),
        ]) });
        if (p.Type === "Loading") return field({ label: "نام کاربری", hint: "در حال بررسی…", control: inputBox({ text: "sepanta", ltr: true, end: [R({ ellipse: true, w: 16, h: 16, stroke: "bg-brand", sw: 2, arc: { startingAngle: 0, endingAngle: 4.5, innerRadius: 0.8 }, name: "Spinner" })] }) });
        return field({ label: "درباره", optional: true, control: inputBox({ text: "طراح محصول", end: [T("۱۰ / ۵۰", { style: "Text xs/Regular", color: "text-quaternary" })] }) });
      },
      docs: "input",
    });
  }));

  safe("Textarea", () => section(root, "Textarea · متن چندخطی", "با شمارندهٔ نویسه و ارتفاع خودکار.", (h) => {
    componentSet(h, "Textarea", {
      axes: { State: ["Default", "Focus", "Error", "Disabled"] },
      build: (p) => field({
        label: "توضیحات", optional: true,
        hint: p.State === "Error" ? undefined : "حداکثر ۲۰۰ نویسه.",
        error: p.State === "Error" ? "متن طولانی‌تر از حد مجاز است." : undefined,
        control: (() => {
          const box = inputBox({ state: p.State, text: p.State === "Default" ? "" : "کاشی یک دیزاین‌سیستم فارسی و راست‌به‌چپ است که برای محصولات ایرانی ساخته شده.", placeholder: "چند خط بنویسید…", h: 128 });
          box.counterAxisAlignItems = "MIN";
          box.paddingTop = box.paddingBottom = 10;
          return box;
        })(),
      }),
      text: { Label: ["Label", "توضیحات"], Hint: ["Hint", "حداکثر ۲۰۰ نویسه."] },
      docs: "input",
    });
  }));

  const cities = ["تهران", "اصفهان", "شیراز", "تبریز", "مشهد"];
  safe("Select", () => section(root, "Select · سلکت", "فهرست کشویی ساده؛ حالت Open پنل گزینه‌ها را هم نشان می‌دهد.", (h) => {
    componentSet(h, "Select", {
      axes: { Size: ["sm", "md", "lg"], State: ["Default", "Open", "Error", "Disabled"] },
      build: (p) => {
        const open = p.State === "Open";
        const node = field({
          label: "شهر",
          error: p.State === "Error" ? "یک شهر انتخاب کنید." : undefined,
          control: inputBox({ size: p.Size, state: open ? "Focus" : p.State, text: p.State === "Error" ? "" : "تهران", placeholder: "انتخاب کنید", end: [I(open ? "chevron-up" : "chevron-down", 20, "text-tertiary")] }),
        });
        if (open) add(node, listbox(cities, { selected: 0, active: 2 }));
        return node;
      },
      text: { Label: ["Label", "شهر"], Value: ["Value", "تهران"] },
      cols: 4,
      docs: "select",
    });
  }));

  safe("Combobox", () => section(root, "Combobox · کامبوباکس", "جستجو «علي» و «علی» را یکی می‌داند و بخش منطبق را برجسته می‌کند.", (h) => {
    componentSet(h, "Combobox", {
      axes: { State: ["Default", "Typing", "Empty"] },
      build: (p) => {
        const typing = p.State !== "Default";
        const node = field({ label: "استان", control: inputBox({ state: typing ? "Focus" : "Default", text: p.State === "Typing" ? "آذر" : p.State === "Empty" ? "کیش" : "", placeholder: "جستجوی استان…", iconStart: "search", end: [I("chevron-down", 20, "text-tertiary")] }) });
        if (p.State === "Typing") add(node, listbox([{ label: "آذربایجان شرقی", description: "تبریز" }, { label: "آذربایجان غربی", description: "ارومیه" }], { selected: -1, active: 0, query: "آذر" }));
        if (p.State === "Empty") add(node, F({ name: "Listbox", dir: "V", p: "space/4", w: FIELD_W, radius: "radius/lg", fill: "bg-elevated", stroke: "border-secondary", shadow: "Popover", cross: "center" }, [T("نتیجه‌ای پیدا نشد.", { style: "Text sm/Regular", color: "text-tertiary" })]));
        return node;
      },
      docs: "combobox",
    });
  }));

  safe("MultiSelect", () => section(root, "Multi select · چندانتخابی", "انتخاب چند گزینه با برچسب‌های قابل حذف.", (h) => {
    componentSet(h, "Multi select", {
      axes: { State: ["Default", "Open"] },
      build: (p) => {
        const open = p.State === "Open";
        const box = tagBox({ state: open ? "Focus" : "Default", tags: [tag("طراحی", { tone: "Brand" }), tag("برنامه‌نویسی", { tone: "Brand" })], end: [I("chevron-down", 20, "text-tertiary")] });
        const node = field({ label: "مهارت‌ها", hint: "تا ۵ مورد", control: box });
        if (open) add(node, listbox([{ label: "طراحی" }, { label: "برنامه‌نویسی" }, { label: "مدیریت محصول" }, { label: "تحقیق کاربر" }], { selected: 0, active: 2 }));
        return node;
      },
      docs: "multi-select",
    });
  }));

  safe("TagInput", () => section(root, "Tag input · ورود برچسب", "با Enter یا ویرگول (،) برچسب جدید اضافه می‌شود.", (h) => {
    componentSet(h, "Tag input", {
      axes: { State: ["Default", "Focus"] },
      build: (p) => field({ label: "برچسب‌ها", hint: "با Enter جدا کنید.", control: tagBox({ state: p.State, placeholder: "افزودن…", tags: [tag("فارسی"), tag("RTL"), tag("React")] }) }),
      docs: "tag-input",
    });
  }));

  safe("Checkbox", () => section(root, "Checkbox · چک‌باکس", "سه وضعیت (خاموش، روشن، نامعین) و چهار حالت.", (h) => {
    componentSet(h, "Checkbox", {
      axes: { Checked: ["Off", "On", "Indeterminate"], State: ["Default", "Hover", "Focus", "Disabled"], Size: ["md", "lg"] },
      build: (p) => checkRow(checkMark("checkbox", { checked: p.Checked, state: p.State, size: p.Size === "lg" ? 20 : 18 }), { disabled: p.State === "Disabled" }),
      text: { Label: ["Label", "مرا به خاطر بسپار"], Description: ["Description", "تا ۳۰ روز وارد حساب بمانید."] },
      bools: { "Show description": ["Description", true] },
      cols: 4,
      docs: "checkbox",
    });
  }));

  safe("Radio", () => section(root, "Radio · دکمهٔ رادیویی", "فقط یک گزینه از گروه انتخاب می‌شود.", (h) => {
    componentSet(h, "Radio", {
      axes: { Checked: ["Off", "On"], State: ["Default", "Hover", "Focus", "Disabled"] },
      build: (p) => checkRow(checkMark("radio", { checked: p.Checked, state: p.State }), { label: "ارسال عادی", description: "۳ تا ۵ روز کاری", disabled: p.State === "Disabled" }),
      text: { Label: ["Label", "ارسال عادی"], Description: ["Description", "۳ تا ۵ روز کاری"] },
      bools: { "Show description": ["Description", true] },
      cols: 4,
      docs: "radio",
    });
  }));

  safe("Switch", () => section(root, "Switch · سوییچ", "روشن و خاموش کردن فوری یک تنظیم.", (h) => {
    componentSet(h, "Switch", {
      axes: { Checked: ["Off", "On"], State: ["Default", "Hover", "Focus", "Disabled"], Size: ["sm", "md", "lg"] },
      build: (p) => checkRow(switchTrack({ checked: p.Checked, state: p.State, size: p.Size }), { label: "اعلان‌ها", description: "دریافت ایمیل هفتگی", disabled: p.State === "Disabled" }),
      text: { Label: ["Label", "اعلان‌ها"], Description: ["Description", "دریافت ایمیل هفتگی"] },
      bools: { "Show description": ["Description", true] },
      cols: 6,
      docs: "switch",
    });
  }));

  safe("ChoiceCard", () => section(root, "Choice card · کارت انتخاب", "رادیو یا چک‌باکس به شکل کارت؛ برای انتخاب پلن یا روش ارسال.", (h) => {
    componentSet(h, "Choice card", {
      axes: { Type: ["Radio", "Checkbox"], Selected: ["Off", "On"] },
      build: (p) => {
        const on = p.Selected === "On";
        return F({ name: "Card", dir: "H", gap: "space/3", p: "space/4", w: 340, cross: "start", radius: "radius/xl", fill: on ? "bg-brand-subtle" : "bg-elevated", stroke: on ? "border-brand" : "border-secondary", sw: on ? 2 : 1 }, [
          F({ name: "Icon", dir: "H", w: 40, h: 40, align: "center", cross: "center", radius: "radius/md", fill: "bg-secondary", stroke: "border-secondary" }, [I("sparkle", 20, on ? "text-brand" : "text-tertiary")]),
          F({ name: "Text", dir: "V", gap: 2, grow: true }, [
            F({ dir: "H", gap: "space/2" }, [T("پلن حرفه‌ای", { style: "Text sm/Semibold", color: "text-primary", name: "Title" }), T("۴۹۰ هزار تومان/ماه", { style: "Text sm/Regular", color: "text-tertiary", name: "Price" })]),
            T("تا ۲۰ کاربر، پشتیبانی اولویت‌دار و گزارش‌های پیشرفته.", { style: "Text sm/Regular", color: "text-tertiary", name: "Description", w: 220 }),
          ]),
          checkMark(p.Type === "Radio" ? "radio" : "checkbox", { checked: p.Selected, size: 18 }),
        ]);
      },
      text: { Title: ["Title", "پلن حرفه‌ای"], Description: ["Description", "تا ۲۰ کاربر، پشتیبانی اولویت‌دار و گزارش‌های پیشرفته."] },
      docs: "radio",
    });
  }));

  safe("Slider", () => section(root, "Slider · اسلایدر", "یک مقدار یا یک بازه؛ با ارقام فارسی.", (h) => {
    componentSet(h, "Slider", {
      axes: { Type: ["Single", "Range"], State: ["Default", "Focus", "Disabled"] },
      build: (p) => {
        const W = FIELD_W;
        const from = p.Type === "Range" ? 0.25 : 0, to = 0.65;
        const brand = p.State === "Disabled" ? "text-quaternary" : "bg-brand";
        const thumb = (x) => R({ ellipse: true, w: 20, h: 20, fill: "#ffffff", stroke: brand, sw: 2, shadow: p.State === "Focus" ? "Input focus" : "Shadow/sm", name: "Thumb", absolute: true, x: x * W - 10, y: 0 });
        const track = F({ name: "Track", dir: "none", w: W, h: 20 }, [
          R({ w: W, h: 6, radius: "radius/full", fill: "bg-tertiary", name: "Rail", x: 0, y: 7 }),
          R({ w: (to - from) * W, h: 6, radius: "radius/full", fill: brand, name: "Fill", x: from * W, y: 7 }),
          p.Type === "Range" && thumb(from),
          thumb(to),
        ]);
        return F({ name: "Slider", dir: "V", gap: "space/2", w: W }, [
          F({ name: "Head", dir: "H", gap: "space/3", w: "fill", align: "between", css: "k-slider__head", cssCheck: ["gap"] }, [
            T(p.Type === "Range" ? "بازهٔ قیمت" : "میزان صدا", { style: "Tight sm/Medium", color: "text-secondary", name: "Label" }),
            T(p.Type === "Range" ? "۲۵ تا ۶۵ میلیون" : "۶۵٪", { style: "Text sm/Semibold", color: "text-primary", name: "Value", css: "k-slider__value" }),
          ]),
          track,
          F({ name: "Marks", dir: "H", w: "fill", align: "between" }, ["۰", "۲۵", "۵۰", "۷۵", "۱۰۰"].map((m) => T(m, { style: "Text xs/Regular", color: "text-tertiary", css: "k-slider__marks" }))),
        ]);
      },
      docs: "slider",
    });
  }));

  safe("NumberInput", () => section(root, "Number input · ورود عدد", "با دکمه‌های کم و زیاد و کلیدهای جهت‌دار.", (h) => {
    componentSet(h, "Number input", {
      axes: { State: ["Default", "Focus", "Disabled"] },
      // k-number: دکمه‌های ۳۶×۳۲ داخل همان فیلد، فاصلهٔ داخلی فیلد ۴ پیکسل
      build: (p) => field({ label: "تعداد", w: 200, control: F({ name: "Number", dir: "H", gap: "space/2", px: "space/1", w: "fill", h: "input/height/md", radius: "radius/md", stroke: p.State === "Focus" ? "border-brand" : "border-input", fill: p.State === "Disabled" ? "bg-secondary" : "bg-primary", shadow: p.State === "Focus" ? "Input focus" : "Shadow/xs", cross: "center" }, [
        F({ name: "Minus", dir: "H", w: 36, h: 32, align: "center", cross: "center", radius: "radius/sm", css: "k-number__step", cssCheck: ["radius", "bg", "w", "h"] }, [I("minus", 16, p.State === "Disabled" ? "text-quaternary" : "text-secondary")]),
        T("۱۲", { style: "Text md/Regular", color: p.State === "Disabled" ? "text-quaternary" : "text-primary", align: "center", grow: true, w: "fill", name: "Value" }),
        F({ name: "Plus", dir: "H", w: 36, h: 32, align: "center", cross: "center", radius: "radius/sm" }, [I("plus", 16, p.State === "Disabled" ? "text-quaternary" : "text-secondary")]),
      ]) }),
      docs: "number-input",
    });
  }));

  safe("OTP", () => section(root, "OTP input · کد یک‌بار مصرف", "ارقام فارسی و لاتین هر دو پذیرفته می‌شوند؛ چسباندن کد کامل هم کار می‌کند.", (h) => {
    componentSet(h, "OTP input", {
      axes: { Length: ["4", "6"], State: ["Empty", "Typing", "Filled", "Error"] },
      build: (p) => {
        const n = Number(p.Length);
        const digits = ["۴", "۸", "۱", "۵", "۹", "۲"];
        const filled = p.State === "Filled" || p.State === "Error" ? n : p.State === "Typing" ? 2 : 0;
        // k-otp__slot: ۵۲×۶۰، گوشهٔ lg، رقم ۲۶ پیکسل؛ خانهٔ پر حاشیهٔ border-primary، خانهٔ فعال حلقهٔ برند و مکان‌نما
        const slots = Array.from({ length: n }, (_, i) => {
          const active = p.State === "Typing" && i === filled;
          const isFilled = i < filled;
          return F({ name: "Slot", dir: "H", w: 52, h: 60, align: "center", cross: "center", radius: "radius/lg", fill: "bg-primary", stroke: p.State === "Error" ? "border-error" : active ? "border-brand" : isFilled ? "border-primary" : "border-input", shadow: active ? "Input focus" : "Shadow/xs",
            css: isFilled && p.State === "Filled" ? "k-otp__slot" : undefined, cssCheck: ["radius", "bg", "border", "w"] }, [
            isFilled ? T(digits[i], { style: "Text sm/Semibold", color: "text-primary", align: "center", size: 26, weight: "semibold", leading: 1.75 }) : active ? R({ w: 2, h: 26, radius: 1, fill: "text-primary", name: "Caret" }) : null,
          ]);
        });
        // شش رقم سه‌تا سه‌تا با خط جداکننده
        const row = n === 6 ? [...slots.slice(0, 3), R({ w: 12, h: 2, fill: "border-primary", name: "Separator", css: "k-otp__sep", cssCheck: ["bg"] }), ...slots.slice(3)] : slots;
        return F({ name: "OTP", dir: "V", gap: "space/1.5" }, [
          T("کد تأیید", { style: "Tight sm/Medium", color: "text-secondary", name: "Label" }),
          LTR({ name: "Digits", dir: "H", gap: "space/2", cross: "center", css: "k-otp", cssCheck: ["gap"] }, row),
          T(p.State === "Error" ? "کد وارد شده درست نیست." : "کد ۶ رقمی به ۰۹۱۲ ۳۴۵ ۶۷۸۹ ارسال شد.", { style: "Tight sm/Regular", color: p.State === "Error" ? "text-error" : "text-tertiary" }),
        ]);
      },
      cols: 4,
      docs: "otp-input",
    });
  }));

  safe("FileUpload", () => section(root, "File upload · آپلود فایل", "کشیدن و رها کردن، با فهرست فایل‌ها و پیشرفت آپلود.", (h) => {
    componentSet(h, "File upload", {
      axes: { State: ["Default", "Drag over", "Uploading"] },
      build: (p) => {
        const drag = p.State === "Drag over";
        // k-dropzone: فاصلهٔ ۳۲/۲۴، حاشیهٔ خط‌چین border-input؛ هنگام کشیدن خط پیوسته و پس‌زمینهٔ برند
        const zone = F({ name: "Dropzone", dir: "V", gap: "space/2", py: "space/8", px: "space/6", w: "fill", cross: "center", radius: "radius/xl", fill: drag ? "bg-brand-subtle" : "bg-primary", stroke: drag ? "border-brand" : "border-input", dash: drag ? undefined : [4, 4],
          css: drag ? undefined : "k-dropzone", cssCheck: ["radius", "gap", "bg", "border"] }, [
          F({ name: "Icon", dir: "H", w: 40, h: 40, align: "center", cross: "center", radius: "radius/lg", fill: "bg-elevated", stroke: "border-primary", shadow: "Button", css: "k-dropzone__icon" }, [I("upload", 20, "text-secondary")]),
          F({ name: "Title", dir: "H", gap: "space/1" }, [
            T("انتخاب فایل", { style: "Text sm/Semibold", color: "text-brand", decoration: "UNDERLINE", name: "Browse" }),
            T("یا فایل را اینجا رها کنید", { style: "Text sm/Regular", color: "text-secondary", name: "Drop" }),
          ]),
          T("PNG، JPG یا PDF؛ هر فایل حداکثر ۱۰ مگابایت", { style: "Text xs/Regular", color: "text-tertiary", name: "Hint", css: "k-dropzone__hint" }),
        ]);
        // k-file: کارت با آیکون پسوند، نام، اندازه و نوار پیشرفت
        const fileRow = (name, ext, meta, pct) => F({ name: "File", dir: "H", gap: "space/3", p: "space/4", w: "fill", cross: "center", radius: "radius/lg", fill: "bg-elevated", stroke: "border-secondary", shadow: "Surface" }, [
          F({ name: "Ext", dir: "H", w: 40, h: 40, align: "center", cross: "center", radius: "radius/md", fill: "bg-brand-subtle" }, [T(ext, { style: "Text xs/Bold", color: "text-brand", size: 10, weight: "bold", leading: 1.2, ltr: true })]),
          F({ dir: "V", gap: "space/1", grow: true }, [
            T(name, { style: "Text sm/Medium", color: "text-primary", ltr: true, align: "end", w: "fill" }),
            T(meta, { style: "Text xs/Regular", color: "text-tertiary" }),
            pct < 1 && F({ name: "Progress", dir: "H", w: "fill", h: 4, radius: "radius/full", fill: "bg-tertiary", clip: true }, [R({ w: 180 * pct, h: 4, radius: "radius/full", fill: "bg-brand", name: "Value" })]),
          ]),
          button({ variant: "Tertiary", size: "sm", iconOnly: "trash" }),
        ]);
        return F({ name: "File upload", dir: "V", gap: "space/4", w: 420 }, [
          zone,
          p.State === "Uploading" && fileRow("brand-guide.pdf", "PDF", "۲٫۴ مگابایت · ۶۰٪", 0.6),
          p.State === "Uploading" && fileRow("logo.png", "PNG", "۸۴۰ کیلوبایت · بارگذاری شد", 1),
        ]);
      },
      docs: "file-upload",
    });
  }));

  safe("Rating", () => section(root, "Rating · امتیاز", "امتیاز ستاره‌ای؛ صفحه‌خوان «۴ از ۵» می‌خواند.", (h) => {
    componentSet(h, "Rating", {
      axes: { Value: ["0", "1", "2", "3", "4", "5"], Size: ["sm", "md"] },
      build: (p) => {
        const s = p.Size === "sm" ? 16 : 24;
        const stars = Array.from({ length: 5 }, (_, i) => {
          const on = i < Number(p.Value);
          const st = I("star", s, on ? "zafaran/400" : "border-primary");
          if (on) for (const n of st.findAll((x) => "fills" in x && x.type === "VECTOR")) n.fills = [paint("zafaran/400")];
          return st;
        });
        return F({ name: "Rating", dir: "H", gap: 2, cross: "center", css: "k-rating", cssCheck: ["gap"] }, [...stars, T(fa(p.Value), { style: "Text sm/Semibold", color: "text-secondary", name: "Value", css: "k-rating__value" })]);
      },
      cols: 6,
      docs: "rating",
    });
  }));

  safe("Password", () => section(root, "Password strength · قدرت رمز", "چهار سطح با پیشنهاد برای رمز بهتر.", (h) => {
    const labels = ["خیلی ضعیف", "ضعیف", "متوسط", "خوب", "قوی"];
    const colors = ["text-error", "text-error", "text-warning", "text-success", "text-success"];
    componentSet(h, "Password strength", {
      axes: { Level: ["0", "1", "2", "3", "4"] },
      build: (p) => {
        const n = Number(p.Level);
        return field({
          label: "رمز عبور",
          control: F({ dir: "V", gap: "space/2", w: "fill" }, [
            inputBox({ text: "•".repeat(4 + n * 2), end: [I("eye", 20, "text-tertiary")] }),
            F({ name: "Bars", dir: "H", gap: "space/1", w: "fill" }, Array.from({ length: 4 }, (_, i) => R({ w: 74, h: 4, radius: "radius/full", fill: i < n ? colors[n] : "bg-tertiary", name: "Bar", grow: true }))),
            F({ dir: "H", w: "fill", align: "between" }, [T(labels[n], { style: "Text sm/Medium", color: colors[n], name: "Strength" }), T("حداقل ۸ نویسه و یک عدد", { style: "Text xs/Regular", color: "text-tertiary" })]),
          ]),
        });
      },
      docs: "password-strength",
    });
  }));

  safe("ColorPicker", () => section(root, "Color picker · انتخاب رنگ", "پالت کاشی به‌همراه رنگ دلخواه با کد هگز.", (h) => {
    componentSet(h, "Color picker", {
      build: () => {
        const scales = ["firoozeh", "lajvard", "zafaran", "anar", "pesteh", "shab"];
        return F({ name: "Color picker", dir: "V", gap: "space/3", p: "space/4", w: 280, radius: "radius/xl", fill: "bg-elevated", stroke: "border-secondary", shadow: "Popover" }, [
          T("رنگ برند", { style: "Text sm/Semibold", color: "text-primary" }),
          F({ name: "Swatches", dir: "H", wrap: true, gap: 8, rowGap: 8, w: "fill" }, scales.flatMap((s) => ["400", "600"].map((st) =>
            R({ ellipse: true, w: 32, h: 32, fill: `${s}/${st}`, stroke: s === "firoozeh" && st === "600" ? "text-primary" : undefined, sw: 2, name: `${s}-${st}`, shadow: "Shadow/xs" }),
          ))),
          F({ name: "Spectrum", dir: "H", w: "fill", h: 120, radius: "radius/md", fill: "firoozeh/500" }),
          F({ dir: "H", gap: "space/2", w: "fill" }, [
            R({ w: 40, h: 40, radius: "radius/md", fill: "firoozeh/600", name: "Preview", shadow: "Shadow/xs", css: "k-color__preview", cssCheck: ["radius", "bg"] }),
            inputBox({ text: "#0B8077", ltr: true }),
          ]),
        ]);
      },
      docs: "color-picker",
    });
  }));

  safe("InlineEdit", () => section(root, "Inline edit · ویرایش درجا", "متن با کلیک به فیلد تبدیل می‌شود.", (h) => {
    componentSet(h, "Inline edit", {
      axes: { State: ["View", "Edit"] },
      build: (p) => p.State === "View"
        ? F({ name: "Inline edit", dir: "H", gap: "space/1.5", px: "space/2", py: "space/1", cross: "center", radius: "radius/md", fill: "bg-hover", css: "k-inline-edit__view" }, [T("گزارش فروش پاییز", { style: "Text md/Regular", color: "text-primary", name: "Value" }), I("edit", 16, "text-quaternary")])
        : F({ name: "Inline edit", dir: "H", gap: "space/1", w: 320, cross: "center" }, [
            inputBox({ state: "Focus", text: "گزارش فروش پاییز" }),
            button({ variant: "Primary", size: "sm", iconOnly: "check" }),
            button({ variant: "Secondary", size: "sm", iconOnly: "close" }),
          ]),
      docs: "inline-edit",
    });
  }));

  safe("Time", () => section(root, "Time input · ساعت", "ساعت ۲۴ ساعته با ارقام فارسی.", (h) => {
    componentSet(h, "Time input", {
      axes: { State: ["Default", "Focus", "Error"] },
      build: (p) => field({ label: "ساعت جلسه", w: 200, error: p.State === "Error" ? "ساعت معتبر نیست." : undefined, control: inputBox({ state: p.State, text: p.State === "Error" ? "۲۵:۷۰" : "۱۴:۳۰", iconStart: "clock" }) }),
      docs: "time-input",
    });
  }));

  safe("DatePicker", () => section(root, "Date picker · انتخاب تاریخ شمسی", "تقویم جلالی دقیق با تعطیلی‌های رسمی؛ هفته از شنبه شروع می‌شود.", (h) => {
    componentSet(h, "Date picker", {
      axes: { State: ["Closed", "Open"] },
      build: (p) => {
        const node = field({ label: "تاریخ تحویل", w: 300, control: inputBox({ state: p.State === "Open" ? "Focus" : "Default", text: "۱۴۰۵/۰۸/۰۶", iconStart: "calendar" }) });
        if (p.State === "Open") add(node, jalaliGrid({}));
        return node;
      },
      docs: "date-picker",
    });
    componentSet(h, "Calendar", {
      axes: { Type: ["Single", "Range"] },
      build: (p) => jalaliGrid(p.Type === "Range" ? { range: [10, 17] } : {}),
      docs: "calendar",
    });
  }));

  safe("MonthPicker", () => section(root, "Month picker · انتخاب ماه", "انتخاب ماه و سال شمسی.", (h) => {
    componentSet(h, "Month picker", {
      // k-monthpicker: سربرگ ۳۶، شبکهٔ ۴ ستونی با فاصلهٔ ۴، هر ماه ۳۲ پیکسل
      build: () => F({ name: "Month picker", dir: "V", gap: "space/3", p: "space/4", w: 320, radius: "radius/xl", fill: "bg-elevated", stroke: "border-secondary", shadow: "Popover" }, [
        F({ name: "Header", dir: "H", gap: "space/2", w: "fill", h: 36, align: "between", cross: "center", css: "k-monthpicker__header", cssCheck: ["gap", "h"] }, [button({ variant: "Tertiary", size: "sm", iconOnly: "chevron-right" }), T("۱۴۰۵", { style: "Text md/Semibold", color: "text-primary", css: "k-monthpicker__year" }), button({ variant: "Tertiary", size: "sm", iconOnly: "chevron-left" })]),
        F({ name: "Grid", dir: "H", wrap: true, gap: "space/1", rowGap: "space/1", w: "fill" }, TOKENS.calendar.months.map((m, i) =>
          F({ name: "Month", dir: "H", w: 69, h: 32, align: "center", cross: "center", radius: "radius/md", fill: i === 7 ? "bg-brand" : undefined, css: i === 0 ? "k-monthpicker__month" : undefined, cssCheck: ["radius", "bg", "h"] }, [T(m, { style: i === 7 ? "Text xs/Semibold" : "Text xs/Medium", color: i === 7 ? "text-on-brand" : "text-secondary", align: "center", css: i === 0 ? "k-monthpicker__month" : undefined }),
          ]),
        )),
      ]),
      docs: "month-picker",
    });
  }));
}
