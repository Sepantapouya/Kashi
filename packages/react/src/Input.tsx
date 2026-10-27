import {
  forwardRef, useId, useRef, useState,
  type ChangeEvent, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes,
} from "react";
import { toFaDigits } from "@kashi-ui/persian";
import { cx } from "./cx.js";
import { Field, describedBy, type FieldClassNames } from "./Field.js";
import { mergeRefs, useIsomorphicLayoutEffect } from "./utils.js";

export type InputSize = "sm" | "md" | "lg";

/** کلاس دلخواه برای هر بخش داخلی فیلد */
export interface InputClassNames extends FieldClassNames {
  /** کادر دور فیلد (k-input) */
  box?: string;
  /** خود input یا textarea */
  control?: string;
  addon?: string;
}

interface FieldOwnProps {
  /** برچسب بالای فیلد — اگر نمی‌دهید حتماً aria-label بدهید */
  label?: ReactNode;
  /** متن راهنمای زیر فیلد */
  hint?: ReactNode;
  /** پیام خطا؛ فیلد را aria-invalid می‌کند */
  error?: ReactNode;
  /** نشان «اختیاری» کنار برچسب؛ رشته برای متن دلخواه */
  optional?: boolean | string;
  /** محتوای انتهای ردیف برچسب، مثل لینک «فراموشی رمز» */
  labelEnd?: ReactNode;
  /** نمایش شمارندهٔ نویسه؛ با maxLength به شکل «۱۲ / ۱۰۰» */
  showCount?: boolean;
  /** کلاس روی ظرف بیرونی (k-field) */
  fieldClassName?: string;
  classNames?: InputClassNames;
}

export interface InputProps extends FieldOwnProps, Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** @default "md" */
  size?: InputSize;
  /** آیکون یا متن ابتدای فیلد */
  addonStart?: ReactNode;
  /** آیکون یا متن انتهای فیلد */
  addonEnd?: ReactNode;
  /** دکمهٔ پاک کردن وقتی فیلد مقدار دارد */
  clearable?: boolean;
  /** پس از پاک کردن */
  onClear?: () => void;
  /** برای type="password": دکمهٔ نمایش و پنهان کردن رمز @default true */
  revealable?: boolean;
  /** اسپینر در انتهای فیلد، مثلاً هنگام بررسی نام کاربری */
  loading?: boolean;
  labels?: { clear?: string; show?: string; hide?: string; loading?: string };
}

const Eye = ({ off }: { off?: boolean }) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1.8 10S4.8 4.5 10 4.5 18.2 10 18.2 10 15.2 15.5 10 15.5 1.8 10 1.8 10Z" />
    <circle cx="10" cy="10" r="2.5" />
    {off && <path d="m3 3 14 14" />}
  </svg>
);
const X = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden="true"><path d="m6 6 8 8M14 6l-8 8" /></svg>
);

/** طول متن فعلی، برای کنترل‌شده و کنترل‌نشده */
function useLength(value: unknown, defaultValue: unknown) {
  const [len, setLen] = useState(() => String(defaultValue ?? "").length);
  const controlled = value !== undefined;
  return [controlled ? String(value ?? "").length : len, (e: { target: { value: string } }) => !controlled && setLen(e.target.value.length)] as const;
}

/** مقدار input را از بیرون عوض می‌کند و رویداد input می‌فرستد تا onChange در React هم اجرا شود */
function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

function Counter({ id, length, max }: { id: string; length: number; max?: number }) {
  return (
    <span className="k-counter" id={id} data-over={max !== undefined && length > max ? "" : undefined}>
      {max !== undefined ? `${toFaDigits(length)} / ${toFaDigits(max)}` : toFaDigits(length)}
    </span>
  );
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label, hint, error, optional, labelEnd, showCount, size = "md", addonStart, addonEnd, clearable, onClear, revealable = true,
    loading, labels = {}, required, id, type = "text", className, fieldClassName, classNames = {},
    "aria-describedby": ariaDescribedBy, onChange, value, defaultValue, maxLength, disabled, readOnly, ...rest
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const inner = useRef<HTMLInputElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [length, trackLength] = useLength(value, defaultValue);
  const isPassword = type === "password";
  const { clear = "پاک کردن", show = "نمایش رمز", hide = "پنهان کردن رمز", loading: loadingLabel = "در حال بررسی" } = labels;
  const counterId = `${inputId}-count`;
  const canClear = clearable && length > 0 && !disabled && !readOnly;

  const end = (
    <>
      {loading && <span className="k-input__addon"><span className="k-spinner k-spinner--sm" role="status" aria-label={loadingLabel} /></span>}
      {canClear && (
        <button
          type="button"
          className="k-input__action"
          aria-label={clear}
          onClick={() => {
            if (inner.current) setNativeValue(inner.current, "");
            inner.current?.focus();
            onClear?.();
          }}
        >
          <X />
        </button>
      )}
      {isPassword && revealable && (
        <button type="button" className="k-input__action" aria-label={revealed ? hide : show} aria-pressed={revealed} onClick={() => setRevealed((r) => !r)}>
          <Eye off={revealed} />
        </button>
      )}
      {addonEnd && <span className={cx("k-input__addon", classNames.addon)}>{addonEnd}</span>}
    </>
  );

  return (
    <Field
      id={inputId} label={label} hint={hint} error={error} required={required} optional={optional} labelEnd={labelEnd}
      hintEnd={showCount ? <Counter id={counterId} length={length} max={maxLength} /> : undefined}
      className={fieldClassName} classNames={classNames}
    >
      <div
        className={cx("k-input", size !== "md" && `k-input--${size}`, className, classNames.box)}
        data-size={size}
        data-state={disabled ? "disabled" : error ? "invalid" : undefined}
      >
        {addonStart && <span className={cx("k-input__addon", classNames.addon)}>{addonStart}</span>}
        <input
          ref={mergeRefs(ref, inner)}
          id={inputId}
          className={cx("k-input__control", classNames.control)}
          type={isPassword && revealed ? "text" : type}
          required={required}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxLength}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, hint, error, [ariaDescribedBy, showCount ? counterId : undefined].filter(Boolean).join(" ") || undefined)}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            trackLength(e);
            onChange?.(e);
          }}
          {...rest}
        />
        {end}
      </div>
    </Field>
  );
});

export interface TextareaProps extends FieldOwnProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** ارتفاع خودکار بر اساس متن */
  autoResize?: boolean;
  /** بیشترین تعداد خط در autoResize */
  maxRows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label, hint, error, optional, labelEnd, showCount, autoResize, maxRows, required, id, className, fieldClassName, classNames = {},
    "aria-describedby": ariaDescribedBy, onChange, value, defaultValue, maxLength, rows = 4, style, ...rest
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const inner = useRef<HTMLTextAreaElement>(null);
  const [length, trackLength] = useLength(value, defaultValue);
  const counterId = `${inputId}-count`;

  // ارتفاع خودکار: در مرورگرهای جدید با field-sizing، وگرنه با اندازه‌گیری scrollHeight
  const resize = () => {
    const el = inner.current;
    if (!el || !autoResize || CSS.supports?.("field-sizing", "content")) return;
    el.style.blockSize = "auto";
    el.style.blockSize = `${el.scrollHeight}px`;
  };
  useIsomorphicLayoutEffect(resize, [value, autoResize]);

  return (
    <Field
      id={inputId} label={label} hint={hint} error={error} required={required} optional={optional} labelEnd={labelEnd}
      hintEnd={showCount ? <Counter id={counterId} length={length} max={maxLength} /> : undefined}
      className={fieldClassName} classNames={classNames}
    >
      <div className={cx("k-input", "k-input--textarea", autoResize && "k-input--autoresize", className, classNames.box)} data-state={error ? "invalid" : undefined}>
        <textarea
          ref={mergeRefs(ref, inner)}
          id={inputId}
          className={cx("k-input__control", classNames.control)}
          required={required}
          rows={rows}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxLength}
          style={maxRows ? { ...style, maxBlockSize: `${maxRows * 1.75 + 0.25}em` } : style}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, hint, error, [ariaDescribedBy, showCount ? counterId : undefined].filter(Boolean).join(" ") || undefined)}
          onChange={(e) => {
            trackLength(e);
            onChange?.(e);
            resize();
          }}
          {...rest}
        />
      </div>
    </Field>
  );
});
