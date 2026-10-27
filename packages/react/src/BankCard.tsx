import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { formatCardNumber, getBankByCard, onlyDigits, toFaDigits, type Bank } from "@kashi-ui/persian";
import { useBankLogo } from "./BankBadge.js";
import { cx } from "./cx.js";

export interface BankCardProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** شمارهٔ کارت با هر خطی؛ بانک از شش رقم اول تشخیص داده می‌شود */
  number: string;
  /** نام دارندهٔ کارت */
  holder?: ReactNode;
  /** تاریخ انقضا: «۰۸/۰۵» یا { year: 1408, month: 5 } */
  expiry?: string | { year: number; month: number };
  /** پنهان کردن ارقام میانی: ۶۱۰۴ ۳۳** **** ۱۲۳۴ @default false */
  masked?: boolean;
  /** بانک دستی، اگر از روی شماره تشخیص داده نشود */
  bank?: Bank | null;
  /** @default "fa" */
  digits?: "fa" | "latin";
  /** نمایش لوگوی بانک @default true */
  showLogo?: boolean;
}

// رنگ تقریبی هویت بصری بانک‌ها؛ برای بقیه رنگ برند کاشی
const COLORS: Record<string, string> = {
  mellat: "#b5172b", melli: "#0b3f7d", saderat: "#203b8c", tejarat: "#173c7a", sepah: "#0d56a0", pasargad: "#2a2418",
  saman: "#0a78b8", parsian: "#7f1c3c", keshavarzi: "#0d6b3a", maskan: "#d4600a", refah: "#0a5a94", "eghtesad-novin": "#5d2a86",
  ayandeh: "#5a3a26", shahr: "#b3232a", resalat: "#23853a", postbank: "#0a703a", dey: "#00676d", sina: "#1d4a92",
  karafarin: "#00877c", "mehr-iran": "#178e42", tosee: "#3b3f8f", gardeshgari: "#8a1f4c", "iran-zamin": "#6a1f7a", sarmayeh: "#2b2b6e",
};

const Chip = () => (
  <svg className="k-bankcard__chip" viewBox="0 0 40 30" aria-hidden="true">
    <rect x="0.5" y="0.5" width="39" height="29" rx="5" />
    <path d="M14 1v28M26 1v28M1 10h13M26 10h13M1 20h13M26 20h13" />
  </svg>
);

/** نمایش کارت بانکی با رنگ و لوگوی بانک، شمارهٔ چهاررقمی و تاریخ انقضا؛ برای کیف پول و انتخاب کارت ذخیره‌شده */
export const BankCard = forwardRef<HTMLElement, BankCardProps>(function BankCard(
  { number, holder, expiry, masked, bank, digits = "fa", showLogo = true, className, style, ...rest },
  ref,
) {
  const raw = onlyDigits(number).slice(0, 16);
  const detected = bank === undefined ? getBankByCard(raw) : bank;
  const logo = useBankLogo(detected?.slug, showLogo);
  const shownRaw = masked && raw.length === 16 ? `${raw.slice(0, 6)}******${raw.slice(12)}` : raw;
  const grouped = shownRaw.replace(/(.{4})(?=.)/g, "$1 ");
  const pad = (n: number) => String(n).padStart(2, "0");
  const exp = typeof expiry === "object" ? `${pad(expiry.year % 100)}/${pad(expiry.month)}` : expiry;
  const d = (s: string) => (digits === "fa" ? toFaDigits(s) : s);
  const spokenNumber = masked ? `مختوم به ${toFaDigits(raw.slice(-4))}` : toFaDigits(formatCardNumber(raw));
  const color = detected ? COLORS[detected.slug] : undefined;

  return (
    <figure
      ref={ref as never}
      className={cx("k-bankcard", className)}
      style={color ? { ...style, ["--k-bankcard-color" as string]: color } : style}
      aria-label={`کارت ${detected?.name ?? "بانکی"}، ${spokenNumber}`}
      {...rest}
    >
      <div className="k-bankcard__top">
        <span className="k-bankcard__bank">
          {logo && <img className="k-bankcard__logo" src={logo} alt="" width={28} height={28} />}
          {detected?.name ?? "کارت بانکی"}
        </span>
        <Chip />
      </div>
      <div className="k-bankcard__number" dir="ltr" aria-hidden="true">{d(grouped)}</div>
      <div className="k-bankcard__bottom" aria-hidden={holder || exp ? undefined : true}>
        {holder && <span className="k-bankcard__holder">{holder}</span>}
        {exp && <span className="k-bankcard__exp"><small>انقضا</small><span dir="ltr">{d(exp)}</span></span>}
      </div>
    </figure>
  );
});
