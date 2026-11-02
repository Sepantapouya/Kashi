import { CITIES } from "./cities.js";
import { toFaDigits } from "./digits.js";
import { formatPostalCode } from "./postal.js";

/** شهرهای یک استان به ترتیب الفبا؛ برای استان ناشناخته آرایهٔ خالی */
export function getCities(province: string | null | undefined): readonly string[] {
  return (province && CITIES[province]) || [];
}

/** استانِ یک شهر؛ اگر نام در چند استان هست (مثل «رودبار»)، همهٔ آن‌ها */
export function getCityProvinces(city: string): string[] {
  return Object.keys(CITIES).filter((p) => CITIES[p].includes(city));
}

/** نشانی ایرانی: استان و شهر، نشانی خیابان و کوچه، پلاک، واحد و کد پستی */
export interface IranAddress {
  province: string | null;
  city: string | null;
  /** خیابان، کوچه و جزئیات */
  street: string;
  plaque: string;
  unit: string;
  postalCode: string;
}

export const EMPTY_ADDRESS: IranAddress = { province: null, city: null, street: "", plaque: "", unit: "", postalCode: "" };

/** نشانی در یک خط، مثل «اصفهان، کاشان، خیابان امیرکبیر، پلاک ۱۲، واحد ۳، کد پستی ۸۷۱۳۷-۱۴۵۶۸» */
export function formatAddress(address: Partial<IranAddress>): string {
  const { province, city, street, plaque, unit, postalCode } = address;
  return [
    province,
    city && city !== province ? city : null,
    street?.trim(),
    plaque?.trim() && `پلاک ${toFaDigits(plaque.trim())}`,
    unit?.trim() && `واحد ${toFaDigits(unit.trim())}`,
    postalCode?.trim() && `کد پستی ${toFaDigits(formatPostalCode(postalCode))}`,
  ].filter(Boolean).join("، ");
}
