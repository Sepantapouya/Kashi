// صفحهٔ سرور (بدون "use client")؛ import مستقیم از پکیج باید در App Router بدون خطا ساخته شود
import "@kashi-ui/css";
import { AddressForm, Button, DatePicker, IranMap } from "@kashi-ui/react";

export default function ServerPage() {
  return (
    <main style={{ display: "grid", gap: 16, maxWidth: 640, padding: 32 }}>
      <Button variant="primary">ثبت</Button>
      <DatePicker label="تاریخ" />
      <IranMap data={{ تهران: 10, فارس: 4 }} />
      <AddressForm name="shipping" />
    </main>
  );
}
