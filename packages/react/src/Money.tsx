import { forwardRef, type HTMLAttributes } from "react";
import { formatMoney, numberToWords, rialToToman, tomanToRial, type FormatMoneyOptions } from "@kashi-ui/persian";
import { cx } from "./cx.js";

export interface MoneyProps extends Omit<HTMLAttributes<HTMLElement>, "children">, Pick<FormatMoneyOptions, "unit" | "from" | "compact" | "digits"> {
  value: number;
  /** رنگ سبز برای مثبت و قرمز برای منفی، با علامت + @default false */
  signed?: boolean;
  /** مبلغ به حروف در title و برای صفحه‌خوان @default true */
  words?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

/** نمایش مبلغ با تومان یا ریال، حالت خلاصه (۱٫۲ میلیون) و مبلغ به حروف برای صفحه‌خوان */
export const Money = forwardRef<HTMLElement, MoneyProps>(function Money(
  { value, unit = "toman", from = "toman", compact, digits = "fa", signed, words = true, size = "md", className, ...rest },
  ref,
) {
  const n = from === unit ? value : from === "rial" ? rialToToman(value) : tomanToRial(value);
  const amount = formatMoney(n, { unit, compact, digits, showUnit: false });
  const full = formatMoney(n, { unit, compact });
  const unitText = full.endsWith("همت") ? null : unit === "toman" ? "تومان" : "ریال";
  const spoken = words && Number.isSafeInteger(Math.round(n)) ? `${numberToWords(Math.round(n))} ${unit === "toman" ? "تومان" : "ریال"}` : undefined;
  const tone = signed ? (n > 0 ? "positive" : n < 0 ? "negative" : undefined) : undefined;
  return (
    <data ref={ref as never} value={String(n)} className={cx("k-money", `k-money--${size}`, className)} data-tone={tone} title={spoken} {...rest}>
      <span className="k-money__amount" aria-hidden={spoken ? true : undefined}>{signed && n > 0 ? "+" : ""}{amount}</span>
      {unitText && <span className="k-money__unit" aria-hidden={spoken ? true : undefined}>{unitText}</span>}
      {spoken && <span className="k-sr-only">{n < 0 ? "" : signed && n > 0 ? "مثبت " : ""}{spoken}</span>}
    </data>
  );
});
