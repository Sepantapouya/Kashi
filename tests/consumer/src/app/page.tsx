"use client";

// صفحهٔ کلاینت با فایل‌هایی که shadcn از رجیستری کاشی در src/components/kashi کپی کرده است
import { useState } from "react";
import { EMPTY_ADDRESS, formatAddress, type IranAddress } from "@kashi-ui/persian";
import { AddressForm } from "@/components/kashi/AddressForm";
import { Button } from "@/components/kashi/Button";
import { DatePicker } from "@/components/kashi/DatePicker";
import { IranMap } from "@/components/kashi/IranMap";
import { PersianInput } from "@/components/kashi/PersianInput";
import { Toaster, toast } from "@/components/kashi/Toast";

export default function Page() {
  const [province, setProvince] = useState<string | null>(null);
  const [address, setAddress] = useState<IranAddress>(EMPTY_ADDRESS);
  return (
    <main style={{ display: "grid", gap: 16, maxWidth: 640, padding: 32 }}>
      <Button variant="primary" onClick={() => toast.success("ذخیره شد")}>ثبت</Button>
      <PersianInput kind="mobile" />
      <DatePicker label="تاریخ" />
      <IranMap value={province} onChange={setProvince} />
      <AddressForm value={address} onChange={setAddress} map />
      <p>{formatAddress(address)}</p>
      <Toaster />
    </main>
  );
}
