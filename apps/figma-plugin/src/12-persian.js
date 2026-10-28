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

/** پلاک ملی؛ همان نسبت‌های k-plate با ارتفاع ۵۶ (عرض ۴٫۷۳ برابر ارتفاع) */
function plate(type = "Private", { first = "۱۲", letter = "ب", middle = "۳۶۵", region = "۴۴", h = 56 } = {}) {
  const bg = { Private: "#ffffff", Taxi: "#f7c600", Government: "#c8102e", Police: "#1f5130" }[type];
  const fg = type === "Government" || type === "Police" ? "#ffffff" : "#111111";
  const seg = (text, w, size, pt) => F({ name: "Segment", dir: "H", w, h: "fill", align: "center", cross: "start", pt }, [T(text, { style: "Text sm/Bold", color: fg, align: "center", size, weight: "bold", leading: 1 })]);
  return LTR({ name: "Plate", dir: "H", gap: 0, w: Math.round(h * 4.73), h, radius: +(h * 0.12).toFixed(2), fill: bg, stroke: "#111111", sw: 2, clip: true, cross: "center", css: type === "Private" ? "k-plate" : undefined, cssCheck: ["radius", "bg", "border", "h"] }, [
    F({ name: "Flag", dir: "V", w: 23.5, h: "fill", gap: +(h * 0.1).toFixed(2), py: +(h * 0.1).toFixed(2), align: "start", cross: "center", fill: "#1f4fa8", css: "k-plate__flag", cssCheck: ["bg"] }, [
      F({ name: "Colors", dir: "V", gap: 0, w: 16.5 }, [R({ w: 16.5, h: 3.13, fill: "#239f40", name: "Green" }), R({ w: 16.5, h: 3.13, fill: "#ffffff", name: "White" }), R({ w: 16.5, h: 3.13, fill: "#da0000", name: "Red" })]),
      T("I.R.\nIRAN", { style: "Text xs/Bold", color: "#ffffff", size: +(h * 0.13).toFixed(2), weight: "bold", leading: 1.15, align: "center", ltr: true }),
    ]),
    seg(first, 56.7, +(h * 0.62).toFixed(2), 6),
    seg(letter, 51, h * 0.5, 0),
    seg(middle, 76.5, +(h * 0.62).toFixed(2), 6),
    F({ name: "Region", dir: "V", w: +(h * 0.95).toFixed(1), h: "fill", gap: 0, pt: +(h * 0.06).toFixed(2), pb: +(h * 0.04).toFixed(2), align: "start", cross: "center", stroke: "#111111", sw: 2, sides: [0, 0, 0, 2] }, [
      T("ایران", { style: "Text xs/Bold", color: fg, size: +(h * 0.2).toFixed(1), weight: "bold", leading: 1, align: "center" }),
      T(region, { style: "Text sm/Bold", color: fg, size: +(h * 0.48).toFixed(1), weight: "bold", leading: 1.15, align: "center" }),
    ]),
  ]);
}

/** گرادیان کارت بانکی (k-bankcard) از رنگ برند کارت */
function cardGradient(hex) {
  const [r, g, b] = hexToRgba(hex);
  const mix = (t, w) => ({ r: r * (1 - w) + t * w, g: g * (1 - w) + t * w, b: b * (1 - w) + t * w, a: 1 });
  return { type: "GRADIENT_LINEAR", gradientTransform: [[0.7071, 0.7071, -0.2071], [-0.7071, 0.7071, 0.5]], gradientStops: [
    { position: 0, color: mix(1, 0.22) }, { position: 0.45, color: { r, g, b, a: 1 } }, { position: 1, color: mix(0, 0.3) },
  ] };
}

function bankCard(slug) {
  const num = CARD_BANKS[slug] || CARD_BANKS.mellat;
  const color = { mellat: "#c8102e", melli: "#1f4fa8", saman: "#0b6bb3", pasargad: "#2b2b2b" }[slug] || paletteHex("firoozeh", 700);
  // k-bankcard: عرض ۳۳۶ با نسبت کارت ۸۵٫۶×۵۴، فاصلهٔ ۲۰/۲۲٫۴، متن سفید
  const W = 336, Hh = Math.round((W * 54) / 85.6);
  const f = F({ name: "Bank card", dir: "V", gap: 0, w: W, h: Hh, py: 20, px: 22.4, align: "between", radius: 17.6, clip: true, shadow: "Shadow/md" }, [
    F({ name: "Top", dir: "H", gap: "space/2", w: "fill", align: "between", cross: "center" }, [
      F({ name: "Bank", dir: "H", gap: "space/2", cross: "center" }, [
        F({ name: "Logo", dir: "H", w: 28, h: 28, p: 2, radius: "radius/md", fill: "#ffffff", align: "center", cross: "center" }, [bankLogo(slug, 24)]),
        T(bankName(slug), { style: "Text sm/Semibold", color: "#ffffff", size: 14, weight: "semibold", leading: 1.5, name: "Bank" }),
      ]),
      R({ w: 38.6, h: 29, radius: 5, fill: "#e9c46a", stroke: [0.47, 0.31, 0.04, 0.45], name: "Chip" }),
    ]),
    T(num, { style: "Text sm/Semibold", color: "#ffffff", align: "center", w: "fill", ltr: true, name: "Number", size: 23, weight: "semibold", leading: 1.75, letterSpacing: 6 }),
    F({ name: "Bottom", dir: "H", gap: "space/3", w: "fill", align: "between", cross: "end" }, [
      T("سپنتا پویا", { style: "Text sm/Medium", color: "#ffffff", size: 14, weight: "medium", leading: 1.5, name: "Holder" }),
      F({ dir: "V", gap: 0, cross: "end" }, [T("انقضا", { style: "Text xs/Regular", color: "#ffffff", size: 11.2, leading: 1.3, opacity: 0.75 }), T("۰۵/۰۸", { style: "Text sm/Regular", color: "#ffffff", size: 14, leading: 1.3, ltr: true, name: "Expiry" })]),
    ]),
  ]);
  f.fills = [cardGradient(color)];
  return f;
}

/** نشان بانک داخل فیلد (k-bank): لوگو ۲۴ روی زمینهٔ سفید و نام بانک */
function bankInline(slug) {
  return F({ name: "Bank", dir: "H", gap: "space/1.5", cross: "center", css: "k-bank", cssCheck: ["gap"] }, [
    F({ name: "Logo", dir: "H", w: 24, h: 24, p: 1, radius: "radius/sm", fill: "#ffffff", align: "center", cross: "center", css: "k-bank__logo", cssCheck: ["pad", "radius", "bg"] }, [bankLogo(slug, 22)]),
    T(bankName(slug), { style: "Text sm/Regular", color: "text-tertiary", name: "Bank name", css: "k-bank" }),
  ]);
}

function buildPersian() {
  const root = kitPage("🇮🇷", "Persian", "کامپوننت‌های فارسی", "فیلدهای مخصوص ایران با اعتبارسنجی واقعی در کد: کارت بانکی (Luhn و تشخیص بانک)، شبا (mod 97)، کد ملی، موبایل و اپراتور، پلاک و مبلغ به حروف.");

  safe("Card", () => section(root, "Card number input · شماره کارت", "با تایپ شش رقم اول، لوگو و نام بانک نمایش داده می‌شود. همهٔ ۵۰ لوگو در صفحهٔ Assets هستند.", (h) => {
    componentSet(h, "Card number input", {
      axes: { Bank: ["Empty", ...Object.keys(CARD_BANKS), "Invalid"] },
      build: (p) => {
        const known = CARD_BANKS[p.Bank];
        return field({
          label: "شماره کارت",
          hint: p.Bank === "Empty" ? "۱۶ رقم روی کارت" : undefined,
          error: p.Bank === "Invalid" ? "شماره کارت معتبر نیست." : undefined,
          control: inputBox({
            state: p.Bank === "Invalid" ? "Error" : "Default",
            text: known || (p.Bank === "Invalid" ? "۶۱۰۴ ۳۳۷۸ ۱۲۳۴ ۰۰۰۰" : ""),
            placeholder: "---- ---- ---- ----",
            ltr: true,
            // مثل CardNumberInput: نام و لوگوی بانک انتهای فیلد (BankBadge)
            end: known ? [bankInline(p.Bank)] : [],
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
        hint: p.State === "Empty" ? "۲۴ رقم بعد از IR" : undefined,
        error: p.State === "Invalid" ? "شماره شبا معتبر نیست." : undefined,
        control: inputBox({
          state: p.State === "Invalid" ? "Error" : "Default",
          text: p.State === "Empty" ? "" : "۱۲ ۰۱۲۰ ۰۰۰۰ ۰۰۰۰ ۱۲۳۴ ۵۶۷۸ ۹۰",
          placeholder: "-- ---- ---- ---- ---- ---- --",
          ltr: true,
          start: [T("IR", { style: "Text md/Semibold", color: "text-tertiary", ltr: true })],
          end: p.State === "Valid" ? [bankInline("mellat")] : p.State === "Invalid" ? [statusIcon(false)] : [],
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
          T("منظورتان", { style: "Tight sm/Regular", color: "text-tertiary" }),
          T("«سلام»", { style: "Tight sm/Semibold", color: "text-brand", css: "k-kbfix__btn" }),
          T("بود؟", { style: "Tight sm/Regular", color: "text-tertiary" }),
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

  safe("Money", () => section(root, "Money · نمایش مبلغ", "مبلغ با جداکنندهٔ هزارگان و واحد کم‌رنگ‌تر؛ مثبت و منفی با رنگ.", (h) => {
    componentSet(h, "Money", {
      axes: { Tone: ["Neutral", "Positive", "Negative"], Size: ["sm", "md", "lg", "xl"] },
      build: (p) => {
        // k-money: مبلغ Semibold، واحد ۰٫۸ برابر (در lg و xl برابر text-sm) با وزن Medium؛ فاصله ۰٫۳em فونت والد (۴٫۵ پیکسل)
        const size = { sm: "sm", md: "md", lg: "xl", xl: "3xl" }[p.Size];
        const px = TOKENS.font.size[size];
        const big = p.Size === "lg" || p.Size === "xl";
        const color = { Neutral: "text-primary", Positive: "text-success", Negative: "text-error" }[p.Tone];
        return F({ name: "Money", dir: "H", gap: 4.5, cross: "baseline", css: p.Tone === "Neutral" && p.Size !== "md" ? `k-money k-money--${p.Size}` : undefined, cssCheck: ["gap"] }, [
          T(p.Tone === "Negative" ? "−۱٬۲۵۰٬۰۰۰" : "۱٬۲۵۰٬۰۰۰", { style: `${p.Size === "xl" ? "Display" : "Text"} ${size}/Semibold`, color, name: "Amount", css: p.Size === "lg" && p.Tone === "Neutral" ? "k-money__amount" : undefined }),
          big ? T("تومان", { style: "Text sm/Medium", color: "text-tertiary", name: "Unit", css: p.Size === "lg" ? "k-money__unit" : undefined })
            : T("تومان", { style: "Text sm/Medium", color: "text-tertiary", name: "Unit", size: Math.round(px * 0.8), weight: "medium", leading: 1.75 }),
        ]);
      },
      text: { Amount: ["Amount", "۱٬۲۵۰٬۰۰۰"], Unit: ["Unit", "تومان"] },
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

  safe("Receipt", () => section(root, "Payment receipt · رسید پرداخت", "رسید موفق، ناموفق یا در انتظار با شمارهٔ پیگیری و لبهٔ بریده.", (h) => {
    componentSet(h, "Payment receipt", {
      axes: { Status: ["Success", "Failed", "Pending"] },
      build: (p) => {
        const tone = { Success: ["text-success", "bg-success-subtle", "success", "پرداخت موفق"], Failed: ["text-error", "bg-error-subtle", "error", "پرداخت ناموفق"], Pending: ["text-warning", "bg-warning-subtle", "clock", "در انتظار تأیید"] }[p.Status];
        const row = (k, v, ltr) => F({ name: "Row", dir: "H", gap: "space/3", w: "fill", h: 28, align: "between", cross: "center", css: "k-receipt__row", cssCheck: ["gap"] }, [T(k, { style: "Text sm/Regular", color: "text-tertiary" }), T(v, { style: "Text sm/Medium", color: "text-primary", ltr })]);
        // k-receipt: گوشهٔ ۲۴ و سایهٔ lg؛ سربرگ ۲۴/۲۰/۲۰، آیکون ۵۶ با هاله، خط‌چین بین بخش‌ها
        return F({ name: "Receipt", dir: "V", gap: 0, w: 416, radius: "radius/2xl", fill: "bg-elevated", stroke: "border-secondary", shadow: "Shadow/lg", css: "k-receipt", cssCheck: ["radius", "bg", "border"] }, [
          F({ name: "Head", dir: "V", gap: "space/1", pt: "space/6", px: "space/5", pb: "space/5", w: "fill", cross: "center", css: "k-receipt__head", cssCheck: ["pad", "gap"] }, [
            F({ name: "Icon wrap", dir: "V", pb: "space/2", cross: "center" }, [
              F({ name: "Icon", dir: "H", w: 56, h: 56, align: "center", cross: "center", radius: "radius/full", fill: tone[1], stroke: tone[1], sw: 8, strokeAlign: "OUTSIDE", strokeOpacity: 0.5 }, [I(tone[2], 28, tone[0])]),
            ]),
            T(tone[3], { style: "Text lg/Semibold", color: tone[0], align: "center", name: "Title" }),
            p.Status !== "Success" && T(p.Status === "Failed" ? "مبلغ تا ۷۲ ساعت به حساب شما برمی‌گردد." : "نتیجه تا چند دقیقهٔ دیگر مشخص می‌شود.", { style: "Text sm/Regular", color: "text-tertiary", align: "center", name: "Description" }),
            F({ name: "Amount", dir: "H", gap: 9, pt: "space/3", cross: "baseline" }, [T("۲۵۰٬۰۰۰", { style: "Display 3xl/Semibold", color: "text-primary" }), T("تومان", { style: "Text sm/Medium", color: "text-tertiary" })]),
            T("دویست و پنجاه هزار تومان", { style: "Text xs/Regular", color: "text-tertiary", align: "center", css: "k-receipt__words" }),
          ]),
          F({ name: "Rows", dir: "V", gap: "space/3", p: "space/5", w: "fill", stroke: "border-secondary", sides: [2, 0, 0, 0], dash: [6, 4] }, [
            row("شمارهٔ پیگیری", "۱۴۰۵۰۸۰۶۷۸۲۱"),
            row("تاریخ", "۶ آبان ۱۴۰۵ · ۱۴:۳۰"),
            row("کارت", "۶۱۰۴ ۳۳** **** ۵۶۷۸", true),
            row("پذیرنده", "فروشگاه کاشی"),
          ]),
          F({ name: "Actions", dir: "H", gap: "space/2", pt: 0, px: "space/5", pb: "space/5", w: "fill", css: "k-receipt__actions", cssCheck: ["pad", "gap"] }, [button({ variant: "Secondary", label: "دریافت رسید", iconStart: "download", w: "fill" }), button({ variant: "Primary", label: p.Status === "Failed" ? "تلاش دوباره" : "بازگشت", w: "fill" })]),
        ]);
      },
      docs: "payment-receipt",
    });
  }));

  safe("DateTile", () => section(root, "Date tile · برگ تقویم", "برگ تقویم شمسی با تاریخ میلادی و مناسبت؛ روز تعطیل قرمز.", (h) => {
    componentSet(h, "Date tile", {
      axes: { Size: ["sm", "md", "lg"], Holiday: ["No", "Yes"] },
      build: (p) => {
        // k-datetile: عرض ۸rem × ضریب اندازه (۰٫۷۵، ۱، ۱٫۳۵)؛ همهٔ اندازه‌ها از همان ضریب
        const k = { sm: 0.75, md: 1, lg: 1.35 }[p.Size];
        const hol = p.Holiday === "Yes";
        const t = (text, size, weight, color, o = {}) => T(text, Object.assign({ style: "Text sm/Regular", color, align: "center", size: +(size * k).toFixed(2), weight, leading: o.leading || 1.4 }, o));
        return F({ name: "Date tile", dir: "V", gap: 0, w: Math.round(128 * k), cross: "center", radius: "radius/xl", fill: "bg-elevated", stroke: "border-secondary", shadow: ["Shadow/sm", "highlight-only"], clip: true }, [
          F({ name: "Head", dir: "H", w: "fill", py: +(5.6 * k).toFixed(1), px: 8, align: "center", fill: hol ? "bg-error" : "bg-brand" }, [t(hol ? "فروردین ۱۴۰۵" : "آبان ۱۴۰۵", 12.8, "semibold", hol ? "#ffffff" : "text-on-brand")]),
          F({ dir: "V", pt: +(4 * k).toFixed(1), cross: "center" }, [t(hol ? "۱" : "۶", 44, "bold", hol ? "text-error" : "text-primary", { leading: 1.15, name: "Day" })]),
          t(hol ? "شنبه" : "سه‌شنبه", 13.6, "medium", "text-secondary", { name: "Weekday" }),
          hol && F({ dir: "V", pt: 2.4, px: 8, cross: "center" }, [t("عید نوروز", 11.5, "semibold", "text-error", { name: "Occasion" })]),
          F({ name: "Gregorian", dir: "H", w: "fill", py: +(4.8 * k).toFixed(1), px: 8, align: "center", stroke: "border-secondary", sides: [1, 0, 0, 0], dash: [3, 3] }, [t(hol ? "۲۱ مارس ۲۰۲۶" : "۲۸ اکتبر ۲۰۲۶", 11.5, "regular", "text-tertiary")]),
        ]);
      },
      docs: "date-tile",
    });
  }));

  safe("Countdown", () => section(root, "Countdown · شمارش معکوس", "برای پیشنهاد ویژه یا اعتبار کد.", (h) => {
    componentSet(h, "Countdown", {
      axes: { Style: ["Blocks", "Inline"] },
      build: (p) => {
        const parts = [["۰۲", "روز"], ["۱۴", "ساعت"], ["۳۵", "دقیقه"], ["۰۹", "ثانیه"]];
        if (p.Style === "Inline") return F({ name: "Countdown", dir: "H", gap: "space/1", cross: "baseline", css: "k-countdown", cssCheck: ["gap"] }, [T("۰۲:۱۴:۳۵:۰۹", { style: "Text sm/Semibold", color: "text-secondary", ltr: true }), T("مانده", { style: "Text sm/Semibold", color: "text-secondary" })]);
        // k-countdown__unit: حداقل ۵۲، فاصلهٔ ۸/۱۲، عدد ۲۴ پیکسل با خط ۱٫۱
        return F({ name: "Countdown", dir: "H", gap: "space/2", cross: "start", css: "k-countdown k-countdown--blocks", cssCheck: ["gap"] }, parts.map(([n, l]) =>
          F({ name: "Unit", dir: "V", gap: "space/1", py: "space/2", px: "space/3", minW: 52, cross: "center", radius: "radius/lg", fill: "bg-elevated", stroke: "border-secondary", shadow: "Surface" }, [
            T(n, { style: "Text sm/Semibold", color: "text-primary", align: "center", size: 24, weight: "semibold", leading: 1.1, ltr: true }),
            T(l, { style: "Text xs/Medium", color: "text-tertiary", align: "center", css: "k-countdown__name" }),
          ]),
        ));
      },
      docs: "countdown",
    });
  }));
}
