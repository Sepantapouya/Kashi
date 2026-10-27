import { useId, useState } from "react";
import { toFaDigits } from "@kashi-ui/persian";
import { cx } from "./cx.js";

export interface RatingProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  /** @default 5 */
  max?: number;
  /** فقط نمایش؛ مقدار اعشاری مثل ۴٫۵ نیم‌ستاره نشان می‌دهد */
  readOnly?: boolean;
  /** نمایش عدد کنار ستاره‌ها */
  showValue?: boolean;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** @default "امتیاز" */
  label?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  /** نام هر ستاره برای صفحه‌خوان @default (n, max) => «n از max» */
  starLabel?: (n: number, max: number) => string;
}

const Star = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3L2.8 9.5l6.4-.8z" />
    {/* نیمهٔ ابتدایی ستاره برای امتیاز اعشاری؛ در RTL سمت راست */}
    <path className="k-rating__half" fill="none" d="M12 2.8v14.3l-5.7 3.1 1.2-6.3L2.8 9.5l6.4-.8z" />
  </svg>
);

const fa = (n: number) => toFaDigits(String(n)).replace(".", "٫");

/** امتیاز ستاره‌ای؛ قابل‌انتخاب با رادیوهای بومی (←→) یا فقط‌خواندنی */
export function Rating({
  value, defaultValue = 0, onChange, max = 5, readOnly, showValue, size = "md", label = "امتیاز", name, disabled, className,
  starLabel = (n, m) => `${fa(n)} از ${fa(m)}`,
}: RatingProps) {
  const id = useId();
  const [inner, setInner] = useState(defaultValue);
  const [hover, setHover] = useState<number | null>(null);
  const current = value ?? inner;
  const shown = hover ?? current;
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  const cls = cx("k-rating", size !== "md" && `k-rating--${size}`, className);

  if (readOnly) {
    return (
      <span className={cls} data-readonly="" role="img" aria-label={`${label}: ${starLabel(current, max)}`}>
        {stars.map((n) => (
          <span key={n} className="k-rating__star" data-filled={n <= Math.floor(current) ? "" : undefined} data-half={n === Math.ceil(current) && current % 1 >= 0.25 ? "" : undefined}>
            <Star />
          </span>
        ))}
        {showValue && <span className="k-rating__value" aria-hidden="true">{fa(current)}</span>}
      </span>
    );
  }

  return (
    <fieldset className={cls} onPointerLeave={() => setHover(null)}>
      <legend className="k-sr-only">{label}</legend>
      {stars.map((n) => (
        <label key={n} className="k-rating__star" data-filled={n <= shown ? "" : undefined} onPointerEnter={() => !disabled && setHover(n)}>
          <input
            type="radio"
            className="k-sr-only"
            name={name ?? id}
            value={n}
            checked={current === n}
            disabled={disabled}
            aria-label={starLabel(n, max)}
            onChange={() => {
              if (value === undefined) setInner(n);
              onChange?.(n);
            }}
          />
          <Star />
        </label>
      ))}
      {showValue && <span className="k-rating__value" aria-hidden="true">{fa(current)}</span>}
    </fieldset>
  );
}
