"use client";

import { forwardRef } from "react";
import { PROVINCES } from "@kashi-ui/persian";
import { Combobox, type ComboboxProps } from "./Combobox.js";
import { useKashi } from "./KashiProvider.js";

export interface ProvinceSelectProps extends Omit<ComboboxProps, "options"> {
  /** نمایش مرکز استان زیر نام @default true */
  showCapital?: boolean;
}

const options = (capital: boolean, label: (c: string) => string) =>
  PROVINCES.map((p) => ({ value: p.name, label: p.name, description: capital ? label(p.capital) : undefined, keywords: [p.capital] }));

/** انتخاب یکی از ۳۱ استان با جستجو؛ با نام مرکز استان هم پیدا می‌شود (مثلاً «مشهد») */
export const ProvinceSelect = forwardRef<HTMLInputElement, ProvinceSelectProps>(function ProvinceSelect(
  { showCapital = true, label, placeholder, ...rest },
  ref,
) {
  const { messages: M } = useKashi();
  return <Combobox ref={ref} label={label ?? M.province.label} placeholder={placeholder ?? M.province.search} options={options(showCapital, M.province.capital)} {...rest} />;
});
