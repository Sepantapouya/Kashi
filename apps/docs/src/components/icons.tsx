// آیکون‌های نمونه برای مستندات (سبک خطی ۲۰×۲۰)
import type { SVGProps } from "react";

const Svg = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props} />
);

export const MailIcon = () => <Svg><rect x="2.5" y="4.5" width="15" height="11" rx="2" /><path d="m3 5.5 7 5 7-5" /></Svg>;
export const SearchIcon = () => <Svg><circle cx="9" cy="9" r="5.5" /><path d="m13.5 13.5 3 3" /></Svg>;
/** فلش «بعدی» — در RTL با data-k-mirror آینه می‌شود */
export const ArrowIcon = () => <Svg data-k-mirror=""><path d="M4 10h12m-5-5 5 5-5 5" /></Svg>;
export const PlusIcon = () => <Svg><path d="M10 4v12M4 10h12" /></Svg>;
export const TrashIcon = () => <Svg><path d="M3.5 5.5h13M8 5.5V4h4v1.5M5 5.5l.8 10.2a1.5 1.5 0 0 0 1.5 1.3h5.4a1.5 1.5 0 0 0 1.5-1.3L15 5.5" /></Svg>;
export const UserIcon = () => <Svg><circle cx="10" cy="7" r="3.5" /><path d="M3.5 17a6.5 6.5 0 0 1 13 0" /></Svg>;
export const HomeIcon = () => <Svg><path d="M3.5 9 10 3.5 16.5 9v7a1 1 0 0 1-1 1h-3v-5h-5v5h-3a1 1 0 0 1-1-1Z" /></Svg>;
export const ChartIcon = () => <Svg><path d="M3.5 16.5h13M6 13V9m4 4V5.5m4 7.5v-3" /></Svg>;
export const UsersIcon = () => <Svg><circle cx="7.5" cy="7" r="3" /><path d="M2.5 16.5a5 5 0 0 1 10 0M13 4.3a3 3 0 0 1 0 5.4M15 12.2a5 5 0 0 1 2.5 4.3" /></Svg>;
export const SettingsIcon = () => <Svg><circle cx="10" cy="10" r="2.5" /><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4" /></Svg>;
export const InboxIcon = () => <Svg><path d="M2.5 11 5 4.5h10l2.5 6.5v4.5a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1Z" /><path d="M2.5 11h4l1 2h5l1-2h4" /></Svg>;
export const WalletIcon = () => <Svg><rect x="2.5" y="5" width="15" height="11" rx="2" /><path d="M13 10.5h4.5M5 5l8-2.5V5" /></Svg>;
export const CheckIcon = () => <Svg><path d="m5 10.5 3.2 3L15 7" /></Svg>;
export const FilterIcon = () => <Svg><path d="M3 5h14M5.5 10h9M8 15h4" /></Svg>;
