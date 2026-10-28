// کامپوننت‌های مخصوص ایران: کارت بانکی، شبا، کد ملی، موبایل، پلاک، مبلغ و ...

/** چیدمان چپ‌به‌راست (برای شماره‌ها): F افقی را برعکس می‌کند، پس ما از قبل برعکس می‌دهیم */
const LTR = (o, kids) => F(o, kids.filter(Boolean).slice().reverse());

const CARD_BANKS = {
  mellat: "۶۱۰۴ ۳۳۷۸ ۱۲۳۴ ۵۶۷۸",
  melli: "۶۰۳۷ ۹۹۷۵ ۱۲۳۴ ۵۶۷۸",
  saman: "۶۲۱۹ ۸۶۱۰ ۱۲۳۴ ۵۶۷۸",
  pasargad: "۵۰۲۲ ۲۹۱۰ ۱۲۳۴ ۵۶۷۸",
  tejarat: "۵۸۵۹ ۸۳۱۱ ۱۲۳۴ ۵۶۷۸",
  saderat: "۶۰۳۷ ۶۹۱۸ ۱۲۳۴ ۵۶۷۸",
  parsian: "۶۲۲۱ ۰۶۱۰ ۱۲۳۴ ۵۶۷۸",
  ayandeh: "۶۳۶۲ ۱۴۱۰ ۱۲۳۴ ۵۶۷۸",
};

function statusIcon(ok) {
  return I(ok ? "success" : "error", 20, ok ? "text-success" : "text-error");
}

function plate(type = "Private", { first = "۱۲", letter = "ب", middle = "۳۶۵", region = "۴۴", h = 56 } = {}) {
  const bg = { Private: "#ffffff", Taxi: "#f5c518", Government: "#c8102e", Police: "#1f5130" }[type];
  const fg = type === "Government" || type === "Police" ? "#ffffff" : "#0d0e11";
  const seg = (text, w) => F({ name: "Segment", dir: "H", w, h: "fill", align: "center", cross: "center" }, [T(text, { style: "Display xl/Bold", color: fg, align: "center", size: 26, weight: "bold", leading: 1.2 })]);
  return LTR({ name: "Plate", dir: "H", gap: 0, h, radius: 6, fill: bg, stroke: "#0d0e11", sw: 2, clip: true, cross: "center" }, [
    F({ name: "IR band", dir: "V", w: 28, h: "fill", gap: 2, align: "end", cross: "center", pb: 6, fill: "#1f3fa8" }, [
      F({ name: "Flag", dir: "V", gap: 0, w: 14 }, [R({ w: 14, h: 3, fill: "#239f40", name: "Green" }), R({ w: 14, h: 3, fill: "#ffffff", name: "White" }), R({ w: 14, h: 3, fill: "#da0000", name: "Red" })]),
      T("I.R.\nIRAN", { style: "Text xs/Bold", color: "#ffffff", size: 6, weight: "bold", leading: 1.1, align: "center", ltr: true }),
    ]),
    seg(first, 46),
    seg(letter, 40),
    seg(middle, 64),
    F({ name: "Region", dir: "V", w: 52, h: "fill", gap: 0, align: "center", cross: "center", stroke: "#0d0e11", sw: 2, sides: [0, 0, 0, 2] }, [
      T("ایران", { style: "Text xs/Semibold", color: fg, size: 10, weight: "semibold", leading: 1.2, align: "center" }),
      T(region, { style: "Display xl/Bold", color: fg, size: 22, weight: "bold", leading: 1.1, align: "center" }),
    ]),
  ]);
}

function bankCard(slug) {
  const num = CARD_BANKS[slug] || CARD_BANKS.mellat;
  return F({ name: "Bank card", dir: "V", gap: 0, w: 340, h: 214, p: 20, align: "between", radius: "radius/xl", fill: "bg-elevated", stroke: "border-secondary", shadow: "Elevated", clip: true }, [
    F({ name: "Top", dir: "H", w: "fill", align: "between", cross: "center" }, [
      F({ dir: "H", gap: "space/2", cross: "center" }, [bankLogo(slug, 32), T(bankName(slug), { style: "Text md/Semibold", color: "text-primary", name: "Bank" })]),
      R({ w: 40, h: 30, radius: 6, fill: "zafaran/300", name: "Chip" }),
    ]),
    T(num, { style: "Display xl/Semibold", color: "text-primary", align: "center", w: "fill", ltr: true, name: "Number", letterSpacing: 4 }),
    F({ name: "Bottom", dir: "H", w: "fill", align: "between", cross: "end" }, [
      F({ dir: "V", gap: 0 }, [T("دارنده کارت", { style: "Text xs/Regular", color: "text-tertiary" }), T("سپنتا پویا", { style: "Text sm/Semibold", color: "text-primary", name: "Holder" })]),
      F({ dir: "V", gap: 0, cross: "end" }, [T("انقضا", { style: "Text xs/Regular", color: "text-tertiary" }), T("۰۸/۰۵", { style: "Text sm/Semibold", color: "text-primary", ltr: true, name: "Expiry" })]),
    ]),
  ]);
}

function buildPersian() {
  const { page, root } = kitPage("🇮🇷 Persian", "کامپوننت‌های فارسی", "فیلدهای مخصوص ایران با اعتبارسنجی واقعی در کد: کارت بانکی (Luhn و تشخیص بانک)، شبا (mod 97)، کد ملی، موبایل و اپراتور، پلاک و مبلغ به حروف.");

  safe("Card", () => section(root, "Card number input · شماره کارت", "با تایپ شش رقم اول، لوگو و نام بانک نمایش داده می‌شود. همهٔ ۵۰ لوگو در صفحهٔ Assets هستند.", (h) => {
    componentSet(h, "Card number input", {
      axes: { Bank: ["Empty", ...Object.keys(CARD_BANKS), "Invalid"] },
      build: (p) => {
        const known = CARD_BANKS[p.Bank];
        return field({
          label: "شماره کارت",
          hint: known ? bankName(p.Bank) : p.Bank === "Empty" ? "۱۶ رقم روی کارت" : undefined,
          error: p.Bank === "Invalid" ? "شماره کارت معتبر نیست." : undefined,
          control: inputBox({
            state: p.Bank === "Invalid" ? "Error" : "Default",
            text: known || (p.Bank === "Invalid" ? "۶۱۰۴ ۳۳۷۸ ۱۲۳۴ ۰۰۰۰" : ""),
            placeholder: "---- ---- ---- ----",
            ltr: true,
            start: [known ? bankLogo(p.Bank, 24) : I("credit-card", 20, p.Bank === "Invalid" ? "text-error" : "text-quaternary")],
            end: known ? [statusIcon(true)] : [],
          }),
        });
      },
      cols: 5,
      docs: "card-number-input",
    });
  }));

  safe("Iban", () => section(root, "IBAN input · شماره شبا", "پیشوند IR ثابت است؛ بانک از روی شبا تشخیص داده می‌شود.", (h) => {
    componentSet(h, "IBAN input", {
      axes: { State: ["Empty", "Valid", "Invalid"] },
      build: (p) => field({
        label: "شماره شبا", w: 380,
        hint: p.State === "Valid" ? "بانک ملت" : p.State === "Empty" ? "۲۴ رقم بعد از IR" : undefined,
        error: p.State === "Invalid" ? "شماره شبا معتبر نیست." : undefined,
        control: inputBox({
          state: p.State === "Invalid" ? "Error" : "Default",
          text: p.State === "Empty" ? "" : "۱۲ ۰۱۲۰ ۰۰۰۰ ۰۰۰۰ ۱۲۳۴ ۵۶۷۸ ۹۰",
          placeholder: "-- ---- ---- ---- ---- ---- --",
          ltr: true,
          start: [T("IR", { style: "Text md/Semibold", color: "text-tertiary", ltr: true }), p.State === "Valid" && bankLogo("mellat", 22)],
          end: p.State === "Empty" ? [] : [statusIcon(p.State === "Valid")],
        }),
      }),
      docs: "iban-input",
    });
  }));

  safe("NationalId", () => section(root, "National ID input · کد ملی", "ده رقم با رقم کنترل؛ ارقام فارسی و لاتین پذیرفته می‌شوند.", (h) => {
    componentSet(h, "National ID input", {
      axes: { State: ["Empty", "Valid", "Invalid"] },
      build: (p) => field({
        label: "کد ملی",
        error: p.State === "Invalid" ? "کد ملی معتبر نیست." : undefined,
        hint: p.State === "Invalid" ? undefined : "بدون خط تیره",
        control: inputBox({ state: p.State === "Invalid" ? "Error" : "Default", text: p.State === "Empty" ? "" : p.State === "Valid" ? "۰۰۱۲۳۴۵۶۷۹" : "۱۱۱۱۱۱۱۱۱۲", placeholder: "۰۰۰-۰۰۰۰۰۰-۰", ltr: true, iconStart: "id-card", end: p.State === "Empty" ? [] : [statusIcon(p.State === "Valid")] }),
      }),
      docs: "national-id-input",
    });
  }));

  safe("Mobile", () => section(root, "Mobile input · شمارهٔ موبایل", "+۹۸ و ۰۰۹۸ خودکار نرمال می‌شوند؛ اپراتور تشخیص داده می‌شود.", (h) => {
    const ops = { "همراه اول": ["۰۹۱۲ ۳۴۵ ۶۷۸۹", "lajvard"], "ایرانسل": ["۰۹۳۵ ۱۲۳ ۴۵۶۷", "zafaran"], "رایتل": ["۰۹۲۱ ۱۲۳ ۴۵۶۷", "anar"] };
    componentSet(h, "Mobile input", {
      axes: { Operator: ["Empty", ...Object.keys(ops)] },
      build: (p) => {
        const op = ops[p.Operator];
        return field({
          label: "شمارهٔ موبایل",
          control: inputBox({
            text: op ? op[0] : "", placeholder: "۰۹۱۲ ۰۰۰ ۰۰۰۰", ltr: true, iconStart: "phone",
            end: op ? [F({ name: "Operator", dir: "H", px: 8, h: 22, cross: "center", radius: "radius/full", fill: `${op[1]}/500`, fillOpacity: 0.16 }, [T(p.Operator, { style: "Text xs/Semibold", color: `${op[1]}/300` })])] : [],
          }),
        });
      },
      docs: "mobile-input",
    });
  }));

  safe("Price", () => section(root, "Price input · مبلغ", "جداکنندهٔ هزارگان و نمایش مبلغ به حروف زیر فیلد.", (h) => {
    componentSet(h, "Price input", {
      axes: { Unit: ["Toman", "Rial"] },
      build: (p) => field({
        label: "مبلغ",
        hint: p.Unit === "Toman" ? "دوازده میلیون و پانصد هزار تومان" : "صد و بیست و پنج میلیون ریال",
        control: inputBox({ text: p.Unit === "Toman" ? "۱۲٬۵۰۰٬۰۰۰" : "۱۲۵٬۰۰۰٬۰۰۰", ltr: true, end: [T(p.Unit === "Toman" ? "تومان" : "ریال", { style: "Text md/Regular", color: "text-tertiary" })] }),
      }),
      docs: "price-input",
    });
  }));

  safe("Plate", () => section(root, "Plate input · پلاک خودرو", "پلاک ملی ایران؛ دو رقم، حرف، سه رقم و کد ایران.", (h) => {
    componentSet(h, "Plate", {
      axes: { Type: ["Private", "Taxi", "Government", "Police"] },
      build: (p) => plate(p.Type),
      docs: "plate-input",
    });
    componentSet(h, "Plate input", {
      axes: { State: ["Default", "Focus"] },
      build: (p) => F({ name: "Plate input", dir: "V", gap: "space/1.5" }, [
        T("پلاک خودرو", { style: "Text sm/Medium", color: "text-secondary", name: "Label" }),
        (() => { const pl = plate("Private", { first: "۱۲", letter: "ب", middle: p.State === "Focus" ? "۳۶" : "۳۶۵" }); if (p.State === "Focus") effectStyle(pl, "Input focus"); return pl; })(),
      ]),
      docs: "plate-input",
    });
  }));

  safe("Simple", () => section(root, "Postal, landline, legal ID · کد پستی، تلفن ثابت، شناسه ملی", "قالب‌بندی خودکار ارقام و نمایش استان برای تلفن ثابت.", (h) => {
    componentSet(h, "Iranian input", {
      axes: { Type: ["Postal code", "Landline", "Legal ID", "Keyboard fix"] },
      build: (p) => {
        if (p.Type === "Postal code") return field({ label: "کد پستی", hint: "۱۰ رقم", control: inputBox({ text: "۱۳۸۱۷-۷۳۴۱۱", ltr: true, iconStart: "map-pin", end: [statusIcon(true)] }) });
        if (p.Type === "Landline") return field({ label: "تلفن ثابت", hint: "تهران", control: inputBox({ text: "۰۲۱ ۸۸۷۷ ۶۶۵۵", ltr: true, iconStart: "landline" }) });
        if (p.Type === "Legal ID") return field({ label: "شناسهٔ ملی شرکت", hint: "۱۱ رقم", control: inputBox({ text: "۱۰۱۰۰۳۸۷۴۰۴", ltr: true, iconStart: "building", end: [statusIcon(true)] }) });
        // اصلاح متنی که با کیبورد انگلیسی تایپ شده
        const f = field({ label: "جستجو", control: inputBox({ text: "sghl", ltr: true, iconStart: "keyboard" }) });
        add(f, F({ name: "Suggestion", dir: "H", gap: "space/1", cross: "center" }, [
          T("منظورتان", { style: "Text sm/Regular", color: "text-tertiary" }),
          T("«سلام»", { style: "Text sm/Semibold", color: "text-brand" }),
          T("بود؟", { style: "Text sm/Regular", color: "text-tertiary" }),
        ]));
        return f;
      },
      docs: "persian-input",
    });
  }));

  safe("Province", () => section(root, "Province select · انتخاب استان", "فهرست ۳۱ استان با جستجوی فارسی.", (h) => {
    componentSet(h, "Province select", {
      axes: { State: ["Closed", "Open"] },
      build: (p) => {
        const node = field({ label: "استان", control: inputBox({ state: p.State === "Open" ? "Focus" : "Default", text: "تهران", iconStart: "map-pin", end: [I("chevron-down", 20, "text-tertiary")] }) });
        if (p.State === "Open") add(node, listbox(TOKENS.calendar.provinces.slice(0, 6), { selected: -1, active: 3 }));
        return node;
      },
      docs: "province-select",
    });
  }));

  safe("Money", () => section(root, "Money · نمایش مبلغ", "مبلغ با واحد کوچک‌تر، حالت فشرده («۱۲٫۵ میلیون») و تغییر مثبت/منفی.", (h) => {
    componentSet(h, "Money", {
      axes: { Format: ["Full", "Compact", "Change"], Size: ["sm", "md", "lg"] },
      build: (p) => {
        const big = { sm: "Text md/Semibold", md: "Display xl/Semibold", lg: "Display 3xl/Semibold" }[p.Size];
        const unit = { sm: "Text xs/Regular", md: "Text sm/Regular", lg: "Text md/Regular" }[p.Size];
        if (p.Format === "Change") return F({ name: "Money", dir: "H", gap: "space/1", cross: "baseline" }, [I("arrow-left", 16, "text-success"), T("+۲٬۴۵۰٬۰۰۰", { style: big, color: "text-success", ltr: true }), T("تومان", { style: unit, color: "text-success" })]);
        return F({ name: "Money", dir: "H", gap: "space/1", cross: "baseline" }, [
          T(p.Format === "Full" ? "۱۲٬۵۰۰٬۰۰۰" : "۱۲٫۵", { style: big, color: "text-primary", name: "Amount" }),
          T(p.Format === "Full" ? "تومان" : "میلیون تومان", { style: unit, color: "text-tertiary", name: "Unit" }),
        ]);
      },
      cols: 3,
      docs: "money",
    });
  }));

  safe("BankCard", () => section(root, "Bank card · کارت بانکی", "نمایش کارت با لوگو و نام بانک.", (h) => {
    componentSet(h, "Bank card", { axes: { Bank: ["mellat", "melli", "saman", "pasargad"] }, build: (p) => bankCard(p.Bank), cols: 2, docs: "bank-card" });
  }));

  safe("BankBadge", () => section(root, "Bank badge · نشان بانک", "لوگو و نام همهٔ بانک‌ها و درگاه‌های پرداخت.", (h) => {
    componentSet(h, "Bank badge", {
      axes: { Bank: BANKS.map((b) => b.slug).filter((s) => S.bankLogos[s]) },
      build: (p) => F({ name: "Bank badge", dir: "H", gap: "space/2", ps: 4, pe: 10, h: 32, cross: "center", radius: "radius/full", fill: "bg-elevated", stroke: "border-secondary" }, [
        bankLogo(p.Bank, 24),
        T(bankName(p.Bank), { style: "Text sm/Medium", color: "text-secondary", name: "Name" }),
      ]),
      cols: 6,
      gap: 12,
      docs: "bank-badge",
    });
  }));

  safe("Receipt", () => section(root, "Payment receipt · رسید پرداخت", "رسید موفق یا ناموفق با شمارهٔ پیگیری.", (h) => {
    componentSet(h, "Payment receipt", {
      axes: { Status: ["Success", "Failed"] },
      build: (p) => {
        const ok = p.Status === "Success";
        const row = (k, v, ltr) => F({ name: "Row", dir: "H", w: "fill", align: "between", py: "space/2", stroke: "border-secondary", sides: [0, 0, 1, 0] }, [T(k, { style: "Text sm/Regular", color: "text-tertiary" }), T(v, { style: "Text sm/Medium", color: "text-primary", ltr })]);
        return F({ name: "Receipt", dir: "V", gap: "space/4", p: "space/6", w: 360, cross: "center", radius: "radius/2xl", fill: "bg-elevated", stroke: "border-secondary", shadow: "Elevated" }, [
          F({ name: "Icon", dir: "H", w: 56, h: 56, align: "center", cross: "center", radius: "radius/full", fill: ok ? "bg-success-subtle" : "bg-error-subtle" }, [I(ok ? "success" : "error", 28, ok ? "text-success" : "text-error")]),
          F({ dir: "V", gap: "space/1", cross: "center" }, [
            T(ok ? "پرداخت موفق" : "پرداخت ناموفق", { style: "Text lg/Semibold", color: "text-primary", align: "center" }),
            T(ok ? "۲٬۴۵۰٬۰۰۰ تومان" : "مبلغ تا ۷۲ ساعت به حساب شما برمی‌گردد.", { style: ok ? "Display xl/Semibold" : "Text sm/Regular", color: ok ? "text-primary" : "text-tertiary", align: "center" }),
          ]),
          F({ name: "Details", dir: "V", gap: 0, w: "fill" }, [
            row("شمارهٔ پیگیری", "۱۴۰۵۰۸۰۶۷۸۲۱"),
            row("تاریخ", "۶ آبان ۱۴۰۵ — ۱۴:۳۰"),
            row("کارت", "۶۱۰۴ **** **** ۵۶۷۸", true),
            row("پذیرنده", "فروشگاه کاشی"),
          ]),
          F({ dir: "H", gap: "space/3", w: "fill" }, [button({ variant: "Secondary", label: "دریافت رسید", iconStart: "download", w: "fill" }), button({ variant: "Primary", label: ok ? "بازگشت" : "تلاش دوباره", w: "fill" })]),
        ]);
      },
      docs: "payment-receipt",
    });
  }));

  safe("DateTile", () => section(root, "Date tile · کاشی تاریخ", "نمایش فشردهٔ تاریخ شمسی برای فهرست رویدادها.", (h) => {
    componentSet(h, "Date tile", {
      axes: { Tone: ["Neutral", "Brand", "Holiday"] },
      build: (p) => F({ name: "Date tile", dir: "V", gap: 0, w: 64, cross: "center", radius: "radius/lg", fill: "bg-elevated", stroke: "border-secondary", clip: true }, [
        F({ dir: "H", w: "fill", h: 22, align: "center", cross: "center", fill: p.Tone === "Brand" ? "bg-brand" : p.Tone === "Holiday" ? "bg-error" : "bg-tertiary" }, [T("آبان", { style: "Text xs/Semibold", color: p.Tone === "Neutral" ? "text-secondary" : "text-on-brand", align: "center" })]),
        T(p.Tone === "Holiday" ? "۸" : "۶", { style: "Display xl/Bold", color: p.Tone === "Holiday" ? "text-error" : "text-primary", align: "center" }),
        T(p.Tone === "Holiday" ? "جمعه" : "چهارشنبه", { style: "Text xs/Regular", color: "text-tertiary", align: "center", name: "Weekday" }),
        R({ w: 1, h: 6, name: "Space" }),
      ]),
      docs: "date-tile",
    });
  }));

  safe("Countdown", () => section(root, "Countdown · شمارش معکوس", "برای پیشنهاد ویژه یا اعتبار کد.", (h) => {
    componentSet(h, "Countdown", {
      axes: { Style: ["Boxed", "Inline"] },
      build: (p) => {
        const parts = [["۰۲", "روز"], ["۱۴", "ساعت"], ["۳۵", "دقیقه"], ["۰۹", "ثانیه"]];
        if (p.Style === "Inline") return F({ name: "Countdown", dir: "H", gap: "space/1", cross: "center" }, [I("clock", 16, "text-warning"), T("۱۴:۳۵:۰۹ مانده", { style: "Text sm/Semibold", color: "text-warning" })]);
        return LTR({ name: "Countdown", dir: "H", gap: "space/2", cross: "start" }, parts.slice().reverse().map(([n, l]) =>
          F({ name: "Unit", dir: "V", gap: "space/1", cross: "center" }, [
            F({ dir: "H", w: 56, h: 56, align: "center", cross: "center", radius: "radius/lg", fill: "bg-elevated", stroke: "border-secondary", shadow: "Shadow/xs" }, [T(n, { style: "Display 2xl/Semibold", color: "text-primary", align: "center" })]),
            T(l, { style: "Text xs/Regular", color: "text-tertiary", align: "center" }),
          ]),
        ));
      },
      docs: "countdown",
    });
  }));
  return page;
}
