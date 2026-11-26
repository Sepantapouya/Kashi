import { compare, frame, table, badge } from "../kit.mjs";

const ok = badge("دارد", "success", true), mid = badge("مهم", "warning", true);
const amounts = ["۱٬۲۵۰٬۰۰۰", "۸۹۰٬۰۰۰", "۱۱٬۱۱۱٬۱۱۱", "۴۵٬۶۰۰"];

export const figures = [
  table(["معیار", "چرا مهم است", "وزیرمتن"], [
    ["خوانایی در اندازهٔ کوچک", "فرم‌ها و جدول‌ها با متن ۱۴ پیکسلی", ok],
    ["وزن‌های کامل", "تیتر، متن و برچسب از یک خانواده", "۱۰۰ تا ۹۰۰، متغیر"],
    ["ارقام فارسی هم‌عرض", "ستون‌های جدول و قیمت مرتب", ok],
    ["حروف لاتین هماهنگ", "نام برند و ایمیل وسط متن فارسی", ok],
    ["مجوز روشن", "استفاده در وب، اپ و فایل طراحی", "OFL، رایگان"],
    ["حجم woff2", "سرعت بارگذاری صفحه", mid],
  ]),
  compare(
    frame(`<p style="margin:0;font:400 26px/1.9 Tahoma;color:var(--k-text-tertiary)">سفارش شما ثبت شد و تا فردا ارسال می‌شود.</p><p style="margin:0;font:700 26px/2.3 var(--k-font-sans)">سفارش شما ثبت شد و تا فردا ارسال می‌شود.</p><p class="fx-note">فونت جایگزین ناهماهنگ: اندازه و فاصلهٔ خط فرق دارد و صفحه می‌پرد</p>`),
    frame(`<p style="margin:0;font:400 26px/1.9 var(--k-font-sans);color:var(--k-text-tertiary)">سفارش شما ثبت شد و تا فردا ارسال می‌شود.</p><p style="margin:0;font:400 26px/1.9 var(--k-font-sans)">سفارش شما ثبت شد و تا فردا ارسال می‌شود.</p><p class="fx-note">جایگزین تنظیم‌شده: پیش و بعد از بارگذاری، خط‌ها سر جایشان می‌مانند</p>`),
    { badLabel: "پرش هنگام تعویض فونت", goodLabel: "بدون پرش" },
  ),
  compare(
    frame(amounts.map((a, i) => `<div style="font:600 30px var(--k-font-sans);text-align:end">${i === 2 ? "11,111,111" : i === 0 ? "1,250,000" : a} <small style="font-size:16px;color:var(--k-text-tertiary)">تومان</small></div>`).join("")),
    frame(amounts.map((a) => `<div style="font:600 30px var(--k-font-sans);text-align:end">${a} <small style="font-size:16px;color:var(--k-text-tertiary)">تومان</small></div>`).join("")),
    { badLabel: "رقم مخلوط و جداکنندهٔ انگلیسی", goodLabel: "رقم فارسی و جداکنندهٔ ٬" },
  ),
];
