import { type ReactNode } from "react";

export interface FieldProps {
  id: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

/** شناسهٔ متن‌های راهنما و خطا برای aria-describedby */
export const hintId = (id: string) => `${id}-hint`;
export const errorId = (id: string) => `${id}-error`;

export function describedBy(id: string, hint: unknown, error: unknown, extra?: string): string | undefined {
  return [extra, error ? errorId(id) : null, hint ? hintId(id) : null].filter(Boolean).join(" ") || undefined;
}

/** قالب مشترک برچسب + کنترل + راهنما/خطا */
export function Field({ id, label, hint, error, required, className, children }: FieldProps) {
  return (
    <div className={className ? `k-field ${className}` : "k-field"}>
      {label && (
        <label className="k-label" htmlFor={id}>
          {label}
          {required && <span className="k-label__required" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {error && <p className="k-hint k-hint--error" id={errorId(id)}>{error}</p>}
      {hint && <p className="k-hint" id={hintId(id)}>{hint}</p>}
    </div>
  );
}
