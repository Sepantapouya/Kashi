"use client";

import { forwardRef, useId, type HTMLAttributes, type ReactNode } from "react";
import { formatJalali, formatTime, getBankByCard, numberToWords, onlyDigits, toFaDigits, bankName } from "@kashi-ui/persian";
import { useBankLogo } from "./BankBadge.js";
import { CopyButton } from "./CopyButton.js";
import { cx } from "./cx.js";
import { ErrorIcon, SuccessIcon, WarningIcon } from "./icons.js";
import { Money } from "./Money.js";
import { useKashi } from "./KashiProvider.js";

export type ReceiptStatus = "success" | "failed" | "pending";

export interface PaymentReceiptProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  status: ReceiptStatus;
  /** مبلغ به تومان (یا unit) */
  amount: number;
  unit?: "toman" | "rial";
  /** عنوان؛ پیش‌فرض بر اساس وضعیت */
  title?: ReactNode;
  /** توضیح کوتاه زیر عنوان، مثل علت خطا */
  description?: ReactNode;
  merchant?: ReactNode;
  /** کد پیگیری؛ دکمهٔ کپی دارد */
  trackingCode?: string;
  /** شمارهٔ مرجع */
  referenceId?: string;
  /** شمارهٔ کارت؛ خودکار پوشانده و بانکش تشخیص داده می‌شود */
  cardNumber?: string;
  date?: Date;
  /** ردیف‌های دیگر */
  rows?: [ReactNode, ReactNode][];
  /** دکمه‌ها، مثل بازگشت به فروشگاه */
  children?: ReactNode;
}

const ICONS = { success: SuccessIcon, failed: ErrorIcon, pending: WarningIcon };

/** رسید پرداخت: وضعیت، مبلغ به عدد و حروف، کد پیگیری با دکمهٔ کپی، کارت پوشانده با لوگوی بانک و تاریخ شمسی */
export const PaymentReceipt = forwardRef<HTMLElement, PaymentReceiptProps>(function PaymentReceipt(
  { status, amount, unit = "toman", title, description, merchant, trackingCode, referenceId, cardNumber, date, rows = [], children, className, ...rest },
  ref,
) {
  const { messages: M, digits: D, locale, n } = useKashi();
  const R = M.receipt;
  const id = useId();
  const card = cardNumber ? onlyDigits(cardNumber) : "";
  const bank = card ? getBankByCard(card) : null;
  const logo = useBankLogo(bank?.slug, Boolean(bank));
  const Icon = ICONS[status];
  const all: [ReactNode, ReactNode][] = [
    ...(merchant ? [[R.merchant, merchant] as [ReactNode, ReactNode]] : []),
    ...(trackingCode ? [[R.tracking, <span className="k-receipt__code"><span dir="ltr">{n(trackingCode)}</span><CopyButton value={trackingCode} iconOnly size="xs" variant="tertiary" labels={{ copy: R.copyTracking }} /></span>] as [ReactNode, ReactNode]] : []),
    ...(referenceId ? [[R.reference, <span dir="ltr">{n(referenceId)}</span>] as [ReactNode, ReactNode]] : []),
    ...(card ? [[R.card, <span className="k-receipt__card">{logo && <img src={logo} alt="" width={20} height={20} />}<span dir="ltr" aria-label={`${bank ? bankName(bank, locale) : R.card} ${M.bankCard.endingIn(n(card.slice(-4)))}`}>{n(`${card.slice(0, 4)}-${card.slice(4, 6)}**-****-${card.slice(-4)}`)}</span></span>] as [ReactNode, ReactNode]] : []),
    ...(date ? [[R.date, `${formatJalali(date, { style: "long", digits: D, locale })}${M.common.list}${R.at(n(formatTime({ hours: date.getHours(), minutes: date.getMinutes() })))}`] as [ReactNode, ReactNode]] : []),
    ...rows,
  ];
  return (
    <section ref={ref} className={cx("k-receipt", className)} data-status={status} aria-labelledby={`${id}-t`} {...rest}>
      <div className="k-receipt__head">
        <span className="k-receipt__icon"><Icon /></span>
        <h2 className="k-receipt__title" id={`${id}-t`}>{title ?? R[status]}</h2>
        {description && <p className="k-receipt__desc">{description}</p>}
        <Money className="k-receipt__amount" value={amount} unit={unit} from={unit} size="xl" words={false} />
        <p className="k-receipt__words">{numberToWords(Math.round(amount), { locale })} {unit === "toman" ? M.money.toman : M.money.rial}</p>
      </div>
      {all.length > 0 && (
        <dl className="k-receipt__rows">
          {all.map(([k, v], i) => <div className="k-receipt__row" key={i}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
      )}
      {children && <div className="k-receipt__actions">{children}</div>}
    </section>
  );
});
