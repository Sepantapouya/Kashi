// @kashi-ui/elements — وب کامپوننت‌های کاشی برای HTML، Vue، Svelte، Angular و هر فریم‌ورک دیگر.
// با import کردن این فایل همهٔ عنصرها ثبت می‌شوند؛ استایل از @kashi-ui/css می‌آید.
import {
  KashiCardNumber, KashiIban, KashiLandline, KashiLegalId, KashiMobile, KashiNationalId, KashiPostalCode, KashiPrice,
} from "./inputs.js";
import { KashiOtp } from "./fields.js";
import { KashiCitySelect, KashiCombobox, KashiProvinceSelect } from "./combobox.js";
import { KashiAddressForm, KashiIranMap } from "./map.js";
import { KashiDropdownMenu, KashiPopover } from "./menu.js";
import { KashiNumberInput, KashiPagination, KashiRating, KashiTagInput } from "./controls.js";
import { KashiDataTable } from "./table.js";
import { KashiCalendar, KashiDatePicker } from "./calendar.js";
import { KashiCountdown, KashiDate, KashiMoney, KashiRelativeTime } from "./display.js";
import { KashiCopyButton, KashiDialog, KashiTabs, KashiTooltip } from "./overlay.js";
import { KashiToaster, toast } from "./toast.js";

export {
  KashiCardNumber, KashiIban, KashiLandline, KashiLegalId, KashiMobile, KashiNationalId, KashiPostalCode, KashiPrice,
  KashiOtp, KashiProvinceSelect, KashiCombobox, KashiCitySelect, KashiIranMap, KashiAddressForm, KashiCalendar, KashiDatePicker,
  KashiCountdown, KashiDate, KashiMoney, KashiRelativeTime,
  KashiCopyButton, KashiDialog, KashiTabs, KashiTooltip, KashiToaster, toast,
  KashiDropdownMenu, KashiPopover, KashiTagInput, KashiNumberInput, KashiRating, KashiPagination, KashiDataTable,
};
export { KashiDigitsInput } from "./inputs.js";
export type { ToastOptions, ToastTone } from "./toast.js";
export type { ComboboxOption } from "./combobox.js";
export type { TableColumn } from "./table.js";

/** نام همهٔ عنصرها؛ مثلاً برای isCustomElement در Vue */
export const KASHI_ELEMENTS = [
  "kashi-national-id", "kashi-legal-id", "kashi-mobile", "kashi-landline", "kashi-card-number", "kashi-iban",
  "kashi-postal-code", "kashi-price", "kashi-otp", "kashi-combobox", "kashi-province-select", "kashi-city-select", "kashi-iran-map", "kashi-address-form", "kashi-calendar", "kashi-date-picker",
  "kashi-money", "kashi-date", "kashi-relative-time", "kashi-countdown",
  "kashi-dialog", "kashi-tabs", "kashi-tooltip", "kashi-copy-button", "kashi-toaster",
  "kashi-dropdown-menu", "kashi-popover", "kashi-tag-input", "kashi-number-input", "kashi-rating", "kashi-pagination", "kashi-data-table",
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
    "kashi-combobox": KashiCombobox;
    "kashi-city-select": KashiCitySelect;
    "kashi-iran-map": KashiIranMap;
    "kashi-address-form": KashiAddressForm;
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
    "kashi-dropdown-menu": KashiDropdownMenu;
    "kashi-popover": KashiPopover;
    "kashi-tag-input": KashiTagInput;
    "kashi-number-input": KashiNumberInput;
    "kashi-rating": KashiRating;
    "kashi-pagination": KashiPagination;
    "kashi-data-table": KashiDataTable;
  }
}
