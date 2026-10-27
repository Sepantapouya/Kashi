// نمونه‌های زندهٔ کارت‌های صفحهٔ اصلی
import { useState } from "react";
import { Calendar, PlateInput, Rating, SegmentedControl, Switch } from "@kashi-ui/react";

export function BentoPlate() {
  return <PlateInput aria-label="پلاک خودرو" defaultValue={{ first: "12", letter: "ب", middle: "345", region: "67" }} />;
}

export function BentoCalendar() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4);
  return <Calendar range={{ start, end: today }} value={today} className="bento-cal" />;
}

export function BentoDirection() {
  const [dir, setDir] = useState<"rtl" | "ltr">("rtl");
  return (
    <div className="bento-dir">
      <SegmentedControl aria-label="جهت" size="sm" value={dir} onChange={(v) => setDir(v as "rtl" | "ltr")} options={[{ value: "rtl", label: "راست‌به‌چپ" }, { value: "ltr", label: "LTR" }]} />
      <div className="bento-dir__card" dir={dir} lang={dir === "rtl" ? "fa" : "en"}>
        <Switch label={dir === "rtl" ? "اعلان‌های ایمیل" : "Email notifications"} defaultChecked />
        <Rating value={4} readOnly size="sm" label={dir === "rtl" ? "امتیاز" : "Rating"} />
      </div>
    </div>
  );
}
