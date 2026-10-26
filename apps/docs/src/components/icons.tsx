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
