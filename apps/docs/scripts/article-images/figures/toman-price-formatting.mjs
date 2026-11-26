import { compare, frame, tiles, icon } from "../kit.mjs";

const product = (price) => `<div style="display:grid;grid-template-columns:120px 1fr;gap:20px;align-items:center">
  <span style="display:grid;place-items:center;height:120px;border-radius:16px;background:linear-gradient(135deg,#e0f2fe,#ccfbf1);color:#0b8077">${icon("headphones", 52)}</span>
  <div style="display:grid;gap:8px"><b style="font-size:20px">هدفون بی‌سیم مدل ۳</b><span style="color:var(--k-text-tertiary);font-size:15px">ارسال رایگان · گارانتی ۱۸ ماهه</span>${price}</div></div>`;

export const figures = [
  compare(
    frame(product(`<b style="font-size:28px">1,250,000</b>`)),
    frame(product(`<b style="font-size:28px">۱٬۲۵۰٬۰۰۰ <small style="font-size:16px;color:var(--k-text-tertiary)">تومان</small></b>`)),
    { badLabel: "بی‌واحد، جداکنندهٔ انگلیسی", goodLabel: "واحد کنار عدد، رقم فارسی" },
  ),
  tiles([
    { big: "۲٬۵۰۰٬۰۰۰٬۰۰۰", title: "کامل", text: "صفحهٔ پرداخت، فاکتور و رسید؛ جایی که دقت مهم است" },
    { big: "۲٫۵ میلیارد", title: "خلاصه", text: "کارت محصول، فهرست و داشبورد؛ جایی که مرور مهم است" },
    { big: `<span style="font-size:24px;line-height:1.6;display:block">دو میلیارد و پانصد میلیون</span>`, title: "به حروف", text: "زیر فیلد مبلغ؛ برای تأیید پیش از پرداخت" },
  ]),
  frame(`<div class="k-field" style="max-width:640px"><label class="k-label">مبلغ انتقال</label>
    <div class="k-input k-input--lg"><input class="k-input__control" value="۱۲٬۵۰۰٬۰۰۰" style="font-size:22px;font-weight:700"><span class="k-input__addon">تومان</span></div>
    <p class="k-hint" style="font-size:16px">دوازده میلیون و پانصد هزار تومان</p></div>
    <p class="fx-note">کاربر «۱۲۵۰۰۰۰۰» تایپ کرد؛ جداکننده خودکار آمد و مبلغ به حروف یک صفر اضافه را فوراً نشان می‌دهد.</p>`, { label: "فیلد مبلغ" }),
];
