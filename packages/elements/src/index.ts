// @kashi-ui/elements — وب کامپوننت‌های کاشی برای HTML، Vue، Svelte، Angular و هر فریم‌ورک دیگر.
// با import کردن این فایل همهٔ عنصرها ثبت می‌شوند؛ استایل از @kashi-ui/css می‌آید.
import {
  KashiCardNumber, KashiIban, KashiLandline, KashiLegalId, KashiMobile, KashiNationalId, KashiPostalCode, KashiPrice,
} from "./inputs.js";
import { KashiOtp, KashiProvinceSelect } from "./fields.js";
import { KashiCalendar, KashiDatePicker } from "./calendar.js";
import { KashiCountdown, KashiDate, KashiMoney, KashiRelativeTime } from "./display.js";
import { KashiCopyButton, KashiDialog, KashiTabs, KashiTooltip } from "./overlay.js";
import { KashiToaster, toast } from "./toast.js";

export {
  KashiCardNumber, KashiIban, KashiLandline, KashiLegalId, KashiMobile, KashiNationalId, KashiPostalCode, KashiPrice,
  KashiOtp, KashiProvinceSelect, KashiCalendar, KashiDatePicker,
  KashiCountdown, KashiDate, KashiMoney, KashiRelativeTime,
  KashiCopyButton, KashiDialog, KashiTabs, KashiTooltip, KashiToaster, toast,
};
export { KashiDigitsInput } from "./inputs.js";
export type { ToastOptions, ToastTone } from "./toast.js";

/** نام همهٔ عنصرها؛ مثلاً برای isCustomElement در Vue */
export const KASHI_ELEMENTS = [
  "kashi-national-id", "kashi-legal-id", "kashi-mobile", "kashi-landline", "kashi-card-number", "kashi-iban",
  "kashi-postal-code", "kashi-price", "kashi-otp", "kashi-province-select", "kashi-calendar", "kashi-date-picker",
  "kashi-money", "kashi-date", "kashi-relative-time", "kashi-countdown",
  "kashi-dialog", "kashi-tabs", "kashi-tooltip", "kashi-copy-button", "kashi-toaster",
] as const;

declare global {
  interface HTMLElementTagNameMap {
    "kashi-national-id": KashiNationalId;
    "kashi-legal-id": KashiLegalId;
    "kashi-mobile": KashiMobile;
    "kashi-landline": KashiLandline;
    "kashi-card-number": KashiCardNumber;
    "kashi-iban": KashiIban;
    "kashi-postal-code": KashiPostalCode;
    "kashi-price": KashiPrice;
    "kashi-otp": KashiOtp;
    "kashi-province-select": KashiProvinceSelect;
    "kashi-calendar": KashiCalendar;
    "kashi-date-picker": KashiDatePicker;
    "kashi-money": KashiMoney;
    "kashi-date": KashiDate;
    "kashi-relative-time": KashiRelativeTime;
    "kashi-countdown": KashiCountdown;
    "kashi-dialog": KashiDialog;
    "kashi-tabs": KashiTabs;
    "kashi-tooltip": KashiTooltip;
    "kashi-copy-button": KashiCopyButton;
    "kashi-toaster": KashiToaster;
  }
}
