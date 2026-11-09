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
import {
  KashiChipGroup, KashiInlineEdit, KashiKeyboardFix, KashiMultiSelect, KashiPasswordStrength, KashiPersianTextarea, KashiPlateInput,
  KashiSlider, KashiTimeInput,
} from "./forms.js";
import { KashiColorPicker, KashiDateRangePicker, KashiFileUpload, KashiMonthPicker } from "./pickers.js";
import {
  KashiActivityHeatmap, KashiBarChart, KashiBarList, KashiLineChart, KashiPieChart, KashiProportionBar, KashiSparkline,
} from "./charts.js";
import { KashiBanner, KashiInput, KashiTextarea } from "./basic.js";
import { KashiAppointmentPicker } from "./appointment.js";
import { KashiCarousel, KashiCommandPalette, KashiContextMenu, KashiSideNav, KashiSplitter, KashiTour, KashiTreeView } from "./nav.js";
import { KashiCalendar, KashiDatePicker } from "./calendar.js";
import { KashiCountdown, KashiDate, KashiMoney, KashiRelativeTime } from "./display.js";
import { KashiCopyButton, KashiDialog, KashiTabs, KashiTooltip } from "./overlay.js";
import { KashiToaster, toast } from "./toast.js";
import { KashiPriceRange, KashiSearchSuggest, KashiSwatchGroup } from "./commerce.js";

export {
  KashiCardNumber, KashiIban, KashiLandline, KashiLegalId, KashiMobile, KashiNationalId, KashiPostalCode, KashiPrice,
  KashiOtp, KashiProvinceSelect, KashiCombobox, KashiCitySelect, KashiIranMap, KashiAddressForm, KashiCalendar, KashiDatePicker,
  KashiCountdown, KashiDate, KashiMoney, KashiRelativeTime,
  KashiCopyButton, KashiDialog, KashiTabs, KashiTooltip, KashiToaster, toast,
  KashiDropdownMenu, KashiPopover, KashiTagInput, KashiNumberInput, KashiRating, KashiPagination, KashiDataTable,
  KashiMultiSelect, KashiSlider, KashiChipGroup, KashiPasswordStrength, KashiPersianTextarea, KashiKeyboardFix, KashiTimeInput,
  KashiPlateInput, KashiInlineEdit, KashiDateRangePicker, KashiMonthPicker, KashiFileUpload, KashiColorPicker,
  KashiBarChart, KashiLineChart, KashiPieChart, KashiBarList, KashiProportionBar, KashiSparkline, KashiActivityHeatmap,
  KashiCommandPalette, KashiContextMenu, KashiCarousel, KashiTreeView, KashiTour, KashiSplitter, KashiSideNav,
  KashiInput, KashiTextarea, KashiBanner, KashiAppointmentPicker,
  KashiPriceRange, KashiSwatchGroup, KashiSearchSuggest,
};
export { KashiDigitsInput } from "./inputs.js";
/** زبان متن‌های داخلی همهٔ عنصرها: setLocale("en") */
export { setLocale } from "./base.js";
export { faMessages, enMessages } from "@kashi-ui/persian";
export type { KashiMessages, KashiMessagesInput, KashiLocale } from "@kashi-ui/persian";
export type { ToastOptions, ToastTone } from "./toast.js";
export type { ComboboxOption } from "./combobox.js";
export type { TableColumn } from "./table.js";
export type { CommandItem, TourStep, TreeNode } from "./nav.js";

/** نام همهٔ عنصرها؛ مثلاً برای isCustomElement در Vue */
export const KASHI_ELEMENTS = [
  "kashi-national-id", "kashi-legal-id", "kashi-mobile", "kashi-landline", "kashi-card-number", "kashi-iban",
  "kashi-postal-code", "kashi-price", "kashi-otp", "kashi-combobox", "kashi-province-select", "kashi-city-select", "kashi-iran-map", "kashi-address-form", "kashi-calendar", "kashi-date-picker",
  "kashi-money", "kashi-date", "kashi-relative-time", "kashi-countdown",
  "kashi-dialog", "kashi-tabs", "kashi-tooltip", "kashi-copy-button", "kashi-toaster",
  "kashi-dropdown-menu", "kashi-popover", "kashi-tag-input", "kashi-number-input", "kashi-rating", "kashi-pagination", "kashi-data-table",
  "kashi-multi-select", "kashi-slider", "kashi-chip-group", "kashi-password-strength", "kashi-persian-textarea", "kashi-keyboard-fix",
  "kashi-time-input", "kashi-plate-input", "kashi-inline-edit",
  "kashi-date-range-picker", "kashi-month-picker", "kashi-file-upload", "kashi-color-picker",
  "kashi-bar-chart", "kashi-line-chart", "kashi-pie-chart", "kashi-bar-list", "kashi-proportion-bar", "kashi-sparkline", "kashi-activity-heatmap",
  "kashi-command-palette", "kashi-context-menu", "kashi-carousel", "kashi-tree-view", "kashi-tour", "kashi-splitter", "kashi-side-nav",
  "kashi-input", "kashi-textarea", "kashi-banner", "kashi-appointment-picker",
  "kashi-price-range", "kashi-swatch-group", "kashi-search-suggest",
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
    "kashi-multi-select": KashiMultiSelect;
    "kashi-slider": KashiSlider;
    "kashi-chip-group": KashiChipGroup;
    "kashi-password-strength": KashiPasswordStrength;
    "kashi-persian-textarea": KashiPersianTextarea;
    "kashi-keyboard-fix": KashiKeyboardFix;
    "kashi-time-input": KashiTimeInput;
    "kashi-plate-input": KashiPlateInput;
    "kashi-inline-edit": KashiInlineEdit;
    "kashi-date-range-picker": KashiDateRangePicker;
    "kashi-month-picker": KashiMonthPicker;
    "kashi-file-upload": KashiFileUpload;
    "kashi-color-picker": KashiColorPicker;
    "kashi-bar-chart": KashiBarChart;
    "kashi-line-chart": KashiLineChart;
    "kashi-pie-chart": KashiPieChart;
    "kashi-bar-list": KashiBarList;
    "kashi-proportion-bar": KashiProportionBar;
    "kashi-sparkline": KashiSparkline;
    "kashi-activity-heatmap": KashiActivityHeatmap;
    "kashi-command-palette": KashiCommandPalette;
    "kashi-context-menu": KashiContextMenu;
    "kashi-carousel": KashiCarousel;
    "kashi-tree-view": KashiTreeView;
    "kashi-tour": KashiTour;
    "kashi-splitter": KashiSplitter;
    "kashi-side-nav": KashiSideNav;
    "kashi-input": KashiInput;
    "kashi-textarea": KashiTextarea;
    "kashi-banner": KashiBanner;
    "kashi-appointment-picker": KashiAppointmentPicker;
    "kashi-price-range": KashiPriceRange;
    "kashi-swatch-group": KashiSwatchGroup;
    "kashi-search-suggest": KashiSearchSuggest;
  }
}
