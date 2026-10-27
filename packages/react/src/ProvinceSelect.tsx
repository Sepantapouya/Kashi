import { forwardRef } from "react";
import { PROVINCES } from "@kashi-ui/persian";
import { Combobox, type ComboboxProps } from "./Combobox.js";

export interface ProvinceSelectProps extends Omit<ComboboxProps, "options"> {
  /** نمایش مرکز استان زیر نام @default true */
  showCapital?: boolean;
}

const options = (capital: boolean) =>
  PROVINCES.map((p) => ({ value: p.name, label: p.name, description: capital ? `مرکز: ${p.capital}` : undefined, keywords: [p.capital] }));

/** انتخاب یکی از ۳۱ استان با جستجو؛ با نام مرکز استان هم پیدا می‌شود (مثلاً «مشهد») */
export const ProvinceSelect = forwardRef<HTMLInputElement, ProvinceSelectProps>(function ProvinceSelect(
  { showCapital = true, label = "استان", placeholder = "جستجوی استان یا شهر", ...rest },
  ref,
) {
  return <Combobox ref={ref} label={label} placeholder={placeholder} options={options(showCapital)} {...rest} />;
});
