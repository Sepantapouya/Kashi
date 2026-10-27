// تصویر معرفی کاشی (پست کانال و پیش‌نمایش شبکه‌های اجتماعی) — فقط با کامپوننت‌های واقعی
import { Badge, BarChart, Button, Calendar, PlateInput, StatCard, Switch } from "@kashi-ui/react";
import { formatNumber } from "@kashi-ui/persian";

export default function PromoArt({ compact = false }: { compact?: boolean }) {
  return (
    <div className="promo-cards" aria-hidden="true">
      <div className="promo-card promo-card--stat">
        <StatCard label="فروش این ماه" value={formatNumber(184_500_000)} unit="تومان" change={12.4} caption="نسبت به ماه قبل" />
      </div>
      <div className="promo-card promo-card--plate">
        <PlateInput aria-label="پلاک" defaultValue={{ first: "12", letter: "ب", middle: "345", region: "67" }} />
      </div>
      <div className="promo-card promo-card--cal">
        <Calendar value={new Date(2026, 9, 27)} range={{ start: new Date(2026, 9, 23), end: new Date(2026, 9, 27) }} holidays />
      </div>
      {!compact && (
        <div className="promo-card promo-card--chart">
          <BarChart title="سفارش‌ها" labels={["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور"]} series={[{ name: "وب", values: [42, 46, 41, 52, 58, 64] }, { name: "اپ", values: [26, 30, 34, 38, 43, 52] }]} height="17rem" labelMax={false} />
        </div>
      )}
      <div className="promo-card promo-card--ui">
        <Switch label="اعلان‌ها" defaultChecked />
        <div className="promo-row"><Badge tone="success" dot>فعال</Badge><Badge tone="brand">جدید</Badge></div>
        <div className="promo-row"><Button variant="primary" size="sm">ثبت</Button><Button size="sm">انصراف</Button></div>
      </div>
    </div>
  );
}
