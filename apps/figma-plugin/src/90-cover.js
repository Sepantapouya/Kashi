// صفحهٔ جلد و راهنمای استفاده

function buildCover() {
  const page = S.nextPage || figma.createPage();
  S.nextPage = null;
  page.name = "📕 Kashi UI Kit";
  const step = (n, title, body) => F({ name: "Step", dir: "H", gap: "space/4", w: "fill", cross: "start", p: "space/5", radius: "radius/xl", fill: "bg-elevated", stroke: "border-secondary" }, [
    F({ dir: "H", w: 32, h: 32, align: "center", cross: "center", radius: "radius/full", fill: "bg-brand-subtle" }, [T(fa(n), { style: "Text sm/Bold", color: "text-brand" })]),
    F({ dir: "V", gap: "space/1", grow: true }, [T(title, { style: "Text md/Semibold", color: "text-primary" }), T(body, { style: "Text sm/Regular", color: "text-tertiary", w: "fill" })]),
  ]);
  const stat = (value, label) => F({ name: "Stat", dir: "V", gap: 0, grow: true, p: "space/5", radius: "radius/xl", fill: "bg-elevated", stroke: "border-secondary" }, [
    T(value, { style: "Display 2xl/Semibold", color: "text-primary" }),
    T(label, { style: "Text sm/Regular", color: "text-tertiary" }),
  ]);
  const root = F({ name: "Cover", dir: "V", gap: 48, p: 96, w: 1440, fill: "bg-primary" }, [
    F({ name: "Hero", dir: "V", gap: "space/5", w: "fill" }, [
      F({ dir: "H", gap: "space/3", cross: "center" }, [
        F({ dir: "H", w: 56, h: 56, align: "center", cross: "center", radius: "radius/xl", fill: "bg-brand", shadow: "Button" }, [T("ک", { style: "Display 2xl/Bold", color: "text-on-brand" })]),
        badge({ tone: "Brand", label: `نسخهٔ ${fa(TOKENS.version)}`, dot: false }),
      ]),
      T("کاشی — دیزاین‌سیستم فارسی", { style: "Display 6xl/Bold", color: "text-primary" }),
      T("کیت فیگمای Kashi UI: راست‌به‌چپ، دسترس‌پذیر و هماهنگ با پکیج‌های @kashi-ui روی npm. همهٔ رنگ‌ها، فاصله‌ها، گردی‌ها و فونت‌ها Variable هستند.", { style: "Text xl/Regular", color: "text-tertiary", w: 900 }),
      F({ dir: "H", gap: "space/3" }, [
        F({ dir: "H", gap: "space/2", px: "space/4", h: 44, cross: "center", radius: "radius/md", fill: "bg-secondary", stroke: "border-secondary" }, [T("npm i @kashi-ui/react @kashi-ui/css", { style: "Text md/Medium", color: "text-secondary", ltr: true })]),
        F({ dir: "H", gap: "space/2", px: "space/4", h: 44, cross: "center", radius: "radius/md", fill: "bg-secondary", stroke: "border-secondary" }, [T("kashi.sepantapouya.com", { style: "Text md/Medium", color: "text-brand", ltr: true })]),
      ]),
    ]),
    F({ name: "Stats", dir: "H", gap: "space/4", w: "fill" }, [
      stat(fa(S.stats.sets) + "+", "کامپوننت"),
      stat(fa(S.stats.components), "variant"),
      stat(fa(S.stats.variables), "متغیر"),
      stat(fa(BANKS.length), "لوگوی بانک"),
    ]),
    T("شروع سریع", { style: "Display xl/Semibold", color: "text-primary" }),
    F({ name: "Steps", dir: "V", gap: "space/3", w: "fill" }, [
      step(1, "تم تیره و روشن", "یک فریم را انتخاب کنید و در پنل سمت راست، بخش Appearance (یا Layer → Variable mode)، مجموعهٔ Kashi · Theme را روی Dark یا Light بگذارید."),
      step(2, "عوض کردن رنگ برند", "در Local variables → Kashi · Primitives، متغیرهای color/brand/* را به رنگ دیگری از پالت (مثلاً lajvard) وصل کنید. همهٔ دکمه‌ها و فیلدها خودکار عوض می‌شوند."),
      step(3, "فونت دلخواه، حتی فونت پولی", "در Kashi · Typography مقدار font/family/sans را به نام فونت نصب‌شده روی سیستمتان (مثل IRANSans یا Yekan Bakh) تغییر دهید؛ یا پلاگین را با همان فونت دوباره اجرا کنید."),
      step(4, "گردی و تراکم", "مجموعه‌های Kashi · Radius (Sharp، Soft، Round) و Kashi · Density (Compact، Comfortable) مثل --k-radius-factor و --k-density در کد کار می‌کنند."),
      step(5, "از طرح تا کد", "نام کامپوننت‌ها و ویژگی‌ها همان prop های React است: <Button variant=\"primary\" size=\"md\"> در فیگما Variant=Primary, Size=md است."),
    ]),
    F({ name: "Author", dir: "H", gap: "space/4", w: "fill", pt: "space/8", cross: "center", stroke: "border-secondary", sides: [1, 0, 0, 0] }, [
      avatar({ size: "lg", initials: "سپ" }),
      F({ dir: "V", gap: 0, grow: true }, [
        T("ساخته شده توسط سپنتا پویا", { style: "Text md/Semibold", color: "text-primary" }),
        T("sepantapouya.com · github.com/Sepantapouya/Kashi · متن‌باز با مجوز MIT", { style: "Text sm/Regular", color: "text-tertiary" }),
      ]),
    ]),
  ]);
  page.appendChild(root);
  setThemeMode(root);
  figma.root.insertChild(0, page);
  return page;
}
