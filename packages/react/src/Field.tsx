import { type ReactNode } from "react";
import { cx } from "./cx.js";

/** کلاس دلخواه برای هر بخش داخلی فیلد */
export interface FieldClassNames {
  root?: string;
  label?: string;
  hint?: string;
  error?: string;
}

export interface FieldProps {
  id: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** نشان «اختیاری» کنار برچسب */
  optional?: boolean | string;
  /** محتوای انتهای ردیف برچسب، مثل شمارندهٔ نویسه یا لینک «فراموشی رمز» */
  labelEnd?: ReactNode;
  /** محتوای انتهای ردیف راهنما، مثل شمارنده */
  hintEnd?: ReactNode;
  className?: string;
  classNames?: FieldClassNames;
  children: ReactNode;
}

/** شناسهٔ متن‌های راهنما و خطا برای aria-describedby */
export const hintId = (id: string) => `${id}-hint`;
export const errorId = (id: string) => `${id}-error`;

export function describedBy(id: string, hint: unknown, error: unknown, extra?: string): string | undefined {
  return [extra, error ? errorId(id) : null, hint ? hintId(id) : null].filter(Boolean).join(" ") || undefined;
}

/** قالب مشترک برچسب + کنترل + راهنما/خطا */
export function Field({ id, label, hint, error, required, optional, labelEnd, hintEnd, className, classNames = {}, children }: FieldProps) {
  const optionalText = optional === true ? "اختیاری" : optional;
  return (
    <div className={cx("k-field", className, classNames.root)} data-invalid={error ? "" : undefined}>
      {(label || labelEnd) && (
        <div className="k-field__label-row">
          {label && (
            <label className={cx("k-label", classNames.label)} htmlFor={id}>
              {label}
              {required && <span className="k-label__required" aria-hidden="true">*</span>}
              {optionalText && <span className="k-label__optional">{optionalText}</span>}
            </label>
          )}
          {labelEnd && <span className="k-field__label-end">{labelEnd}</span>}
        </div>
      )}
      {children}
      {(error || hint || hintEnd) && (
        <div className="k-field__hint-row">
          <div className="k-field__hints">
            {error && <p className={cx("k-hint k-hint--error", classNames.error)} id={errorId(id)}>{error}</p>}
            {hint && <p className={cx("k-hint", classNames.hint)} id={hintId(id)}>{hint}</p>}
          </div>
          {hintEnd}
        </div>
      )}
    </div>
  );
}
