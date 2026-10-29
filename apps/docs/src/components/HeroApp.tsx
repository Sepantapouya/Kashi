// نمای محصول در هیرو: یک پنل مدیریت کامل فقط با کامپوننت‌های کاشی
import { useState } from "react";
import { Avatar, Badge, Button, ChipGroup, SegmentedControl, SideNav, StatCard, StatGrid } from "@kashi-ui/react";
import { formatNumber } from "@kashi-ui/persian";
import { Icon } from "@kashi-ui/icons/react";
import type { IconName } from "@kashi-ui/icons";

const I = ({ d }: { d: IconName }) => <Icon name={d} />;
const home = "home";
const chart = "chart";
const users = "users";
const inbox = "inbox";
const gear = "settings";
const wallet = "wallet";

const Spark = ({ points, tone = "brand" }: { points: number[]; tone?: "brand" | "error" }) => {
  const max = Math.max(...points), min = Math.min(...points);
  const d = points.map((p, i) => `${(i / (points.length - 1)) * 100},${28 - ((p - min) / (max - min || 1)) * 24}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true" className="spark" style={{ color: `var(--k-text-${tone})` }}>
      <polyline points={d} fill="none" stroke="currentColor" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

const orders = [
  { name: "مریم کریمی", city: "تهران", amount: 3_900_000, status: "paid" },
  { name: "علی رضایی", city: "اصفهان", amount: 1_250_000, status: "pending" },
  { name: "نگار صادقی", city: "شیراز", amount: 620_000, status: "paid" },
  { name: "رضا نوری", city: "تبریز", amount: 480_000, status: "failed" },
];
const STATUS = { paid: ["success", "پرداخت‌شده"], pending: ["warning", "در انتظار"], failed: ["error", "ناموفق"] } as const;

export default function HeroApp() {
  const [range, setRange] = useState("30");
  const [filter, setFilter] = useState<string[]>([]);
  const rows = filter.length ? orders.filter((o) => filter.includes(o.status)) : orders;
  return (
    <div className="app">
      <SideNav
        aria-label="پنل نمونه"
        className="app__nav"
        header={<strong className="app__brand">فروشگاه نارون</strong>}
        sections={[
          { items: [
            { label: "داشبورد", href: "#", icon: <I d={home} />, current: true },
            { label: "سفارش‌ها", href: "#", icon: <I d={inbox} />, badge: <Badge size="sm" tone="brand">۱۲</Badge> },
            { label: "گزارش‌ها", href: "#", icon: <I d={chart} /> },
            { label: "مشتریان", href: "#", icon: <I d={users} /> },
          ] },
          { label: "تنظیمات", items: [{ label: "پرداخت", href: "#", icon: <I d={wallet} /> }, { label: "عمومی", href: "#", icon: <I d={gear} /> }] },
        ]}
        footer={<div className="app__me"><Avatar name="سپنتا پویا" size="sm" brand /><span>سپنتا پویا</span></div>}
      />
      <div className="app__main">
        <div className="app__head">
          <div>
            <p className="app__title">داشبورد فروش</p>
            <p className="app__sub">آبان ۱۴۰۵</p>
          </div>
          <div className="app__actions">
            <SegmentedControl aria-label="بازهٔ زمانی" size="sm" value={range} onChange={setRange} options={[{ value: "7", label: "۷ روز" }, { value: "30", label: "۳۰ روز" }, { value: "90", label: "۹۰ روز" }]} />
            <Button size="sm" variant="primary">گزارش جدید</Button>
          </div>
        </div>
        <StatGrid className="app__stats">
          <StatCard label="فروش" value={formatNumber(184_500_000)} unit="تومان" change={12.4} caption="نسبت به ماه قبل"><Spark points={[4, 6, 5, 8, 7, 9, 12]} /></StatCard>
          <StatCard label="سفارش‌ها" value={formatNumber(1_284)} change={8} caption="نسبت به ماه قبل"><Spark points={[3, 4, 4, 6, 5, 7, 8]} /></StatCard>
          <StatCard label="نرخ مرجوعی" value="۱٫۸٪" change={-0.6} invertTrend caption="بهتر از ماه قبل"><Spark points={[6, 5, 6, 4, 4, 3, 3]} tone="error" /></StatCard>
        </StatGrid>
        <div className="app__card">
          <div className="app__card-head">
            <p className="app__card-title">آخرین سفارش‌ها</p>
            <ChipGroup aria-label="وضعیت" value={filter} onChange={setFilter} options={[{ value: "paid", label: "پرداخت‌شده" }, { value: "pending", label: "در انتظار" }, { value: "failed", label: "ناموفق" }]} />
          </div>
          <table className="k-table app__table">
            <thead><tr><th scope="col">مشتری</th><th scope="col">شهر</th><th scope="col">وضعیت</th><th scope="col" className="k-table__num">مبلغ</th></tr></thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.name}>
                  <td><span className="app__cust"><Avatar name={o.name} size="xs" color="auto" />{o.name}</span></td>
                  <td>{o.city}</td>
                  <td><Badge size="sm" tone={STATUS[o.status as keyof typeof STATUS][0]} dot>{STATUS[o.status as keyof typeof STATUS][1]}</Badge></td>
                  <td className="k-table__num">{formatNumber(o.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
