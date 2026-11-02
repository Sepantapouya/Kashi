"use client";

import { useState, type ReactNode } from "react";
import { EMPTY_ADDRESS, getCities, type IranAddress } from "@kashi-ui/persian";
import { cx } from "./cx.js";
import { CitySelect } from "./CitySelect.js";
import { Input, Textarea } from "./Input.js";
import { IranMap } from "./IranMap.js";
import { PostalCodeInput } from "./PostalCodeInput.js";
import { ProvinceSelect } from "./ProvinceSelect.js";

type Field = keyof IranAddress;

export interface AddressFormProps {
  value?: IranAddress;
  defaultValue?: Partial<IranAddress>;
  onChange?: (address: IranAddress) => void;
  /** خطای هر فیلد، مثلاً از اعتبارسنجی سرور */
  errors?: Partial<Record<Field, ReactNode>>;
  /** پیشوند نام فیلدها در فرم HTML: name="shipping" ← shipping[province]، shipping[city]، … */
  name?: string;
  /** عنوان فیلدها (legend) @default «نشانی» */
  legend?: ReactNode;
  /** برچسب هر فیلد */
  labels?: Partial<Record<Field, string>>;
  /** نقشهٔ ایران کنار فیلدها برای انتخاب استان @default false */
  map?: boolean;
  /** فیلد واحد اختیاری است و بقیه اجباری @default true */
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const LABELS: Record<Field, string> = { province: "استان", city: "شهر", street: "نشانی", plaque: "پلاک", unit: "واحد", postalCode: "کد پستی" };

/**
 * فرم نشانی ایرانی: استان، شهرِ همان استان، نشانی، پلاک، واحد و کد پستی ده‌رقمی.
 * با انتخاب شهر بدون استان، استان خودکار پر می‌شود؛ با عوض شدن استان، شهرِ نامربوط پاک می‌شود.
 */
export function AddressForm({
  value, defaultValue, onChange, errors = {}, name, legend = "نشانی", labels: labelsProp, map = false, required = true, disabled, className,
}: AddressFormProps) {
  const [inner, setInner] = useState<IranAddress>({ ...EMPTY_ADDRESS, ...defaultValue });
  const address = value ?? inner;
  const labels = { ...LABELS, ...labelsProp };
  const field = (key: Field) => (name ? `${name}[${key}]` : undefined);

  const update = (patch: Partial<IranAddress>) => {
    const next = { ...address, ...patch };
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  const setProvince = (province: string | null) => {
    // شهر فقط وقتی می‌ماند که در استان تازه هم باشد (شهرهای خارج از فهرست هم پاک می‌شوند)
    const keep = province && address.city && getCities(province).includes(address.city);
    update({ province, city: keep ? address.city : null });
  };

  return (
    <fieldset className={cx("k-address", map && "k-address--map", className)} disabled={disabled}>
      {legend && <legend className="k-address__legend">{legend}</legend>}
      <div className="k-address__fields">
        <ProvinceSelect
          className="k-address__province"
          label={labels.province}
          value={address.province}
          onChange={setProvince}
          error={errors.province}
          required={required}
          showCapital={false}
          placeholder="جستجوی استان"
        />
        <CitySelect
          className="k-address__city"
          label={labels.city}
          province={address.province}
          value={address.city}
          onChange={(city, province) => update({ city, ...(province && !address.province ? { province } : {}) })}
          error={errors.city}
          required={required}
        />
        <Textarea
          fieldClassName="k-address__street"
          label={labels.street}
          value={address.street}
          onChange={(e) => update({ street: e.target.value })}
          error={errors.street}
          required={required}
          name={field("street")}
          autoComplete="street-address"
          placeholder="خیابان، کوچه، نام ساختمان"
          rows={2}
          autoResize
        />
        <Input
          fieldClassName="k-address__plaque"
          label={labels.plaque}
          value={address.plaque}
          onChange={(e) => update({ plaque: e.target.value })}
          error={errors.plaque}
          required={required}
          name={field("plaque")}
          inputMode="numeric"
          autoComplete="address-line2"
        />
        <Input
          fieldClassName="k-address__unit"
          label={labels.unit}
          value={address.unit}
          onChange={(e) => update({ unit: e.target.value })}
          error={errors.unit}
          optional={required}
          name={field("unit")}
          inputMode="numeric"
          autoComplete="address-line3"
        />
        <PostalCodeInput
          fieldClassName="k-address__postal"
          label={labels.postalCode}
          value={address.postalCode}
          onValueChange={(postalCode) => update({ postalCode })}
          error={errors.postalCode}
          required={required}
          name={field("postalCode")}
        />
      </div>

      {map && (
        <IranMap
          className="k-address__map"
          label={`${labels.province} روی نقشه`}
          value={address.province}
          onChange={setProvince}
        />
      )}

      {name && (
        <>
          <input type="hidden" name={field("province")} value={address.province ?? ""} />
          <input type="hidden" name={field("city")} value={address.city ?? ""} />
        </>
      )}
    </fieldset>
  );
}
