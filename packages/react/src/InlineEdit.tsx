import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "./cx.js";

export interface InlineEditProps {
  value?: string;
  defaultValue?: string;
  /** پس از ثبت؛ اگر Promise برگرداند تا پایانش منتظر می‌ماند و در خطا متن قبلی برمی‌گردد */
  onSave?: (value: string) => void | Promise<void>;
  /** نام فیلد برای صفحه‌خوان، مثل «نام پروژه» (الزامی) */
  label: string;
  placeholder?: string;
  /** اعتبارسنجی؛ پیام خطا یا undefined */
  validate?: (value: string) => string | undefined;
  /** نمایش متن، مثلاً به‌شکل عنوان */
  renderView?: (value: string) => ReactNode;
  className?: string;
  labels?: { edit?: string; save?: string; cancel?: string; empty?: string };
}

const Pencil = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m13.5 3.5 3 3L7 16H4v-3Z" /></svg>;
const Check = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 10.5 3.2 3L15 7" /></svg>;
const X = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true"><path d="m6 6 8 8M14 6l-8 8" /></svg>;

/** ویرایش درجا: کلیک یا Enter برای ویرایش، Enter ثبت، Esc انصراف */
export function InlineEdit({ value, defaultValue = "", onSave, label, placeholder, validate, renderView, className, labels = {} }: InlineEditProps) {
  const { edit = "ویرایش", save = "ثبت", cancel = "انصراف", empty = "خالی" } = labels;
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(current);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const view = useRef<HTMLButtonElement>(null);
  const back = useRef(false);

  useEffect(() => {
    if (editing) input.current?.select();
    else if (back.current) {
      back.current = false;
      view.current?.focus();
    }
  }, [editing]);

  const start = () => {
    setDraft(current);
    setError(undefined);
    setEditing(true);
  };
  const stop = () => {
    back.current = true;
    setEditing(false);
  };
  const commit = async () => {
    const v = draft.trim();
    const err = validate?.(v);
    if (err) return setError(err);
    if (v === current) return stop();
    const prev = current;
    if (value === undefined) setInner(v);
    setBusy(true);
    try {
      await onSave?.(v);
      stop();
    } catch {
      if (value === undefined) setInner(prev);
      setError("ذخیره نشد؛ دوباره امتحان کنید.");
    } finally {
      setBusy(false);
    }
  };

  if (!editing) {
    return (
      <span className={cx("k-inline-edit", className)}>
        <button ref={view} type="button" className="k-inline-edit__view" onClick={start} aria-label={`${label}: ${current || empty}، ${edit}`}>
          {current ? (renderView ? renderView(current) : current) : <span className="k-inline-edit__placeholder">{placeholder ?? empty}</span>}
          <Pencil />
        </button>
      </span>
    );
  }
  const errId = `${label}-err`.replace(/\s/g, "-");
  return (
    <span className={cx("k-inline-edit", className)}>
      <span className="k-field" style={{ gap: 4 }}>
        <span className="k-input" data-state={error ? "invalid" : undefined}>
          <input
            ref={input}
            className="k-input__control"
            aria-label={label}
            value={draft}
            placeholder={placeholder}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errId : undefined}
            disabled={busy}
            onChange={(e) => {
              setDraft(e.target.value);
              setError(undefined);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              } else if (e.key === "Escape") {
                e.preventDefault();
                stop();
              }
            }}
          />
        </span>
        {error && <span className="k-hint k-hint--error" id={errId}>{error}</span>}
      </span>
      <span className="k-inline-edit__actions">
        <button type="button" className="k-btn k-btn--primary k-btn--icon k-btn--sm" aria-label={save} aria-busy={busy || undefined} onClick={commit}><Check /></button>
        <button type="button" className="k-btn k-btn--secondary k-btn--icon k-btn--sm" aria-label={cancel} onClick={stop}><X /></button>
      </span>
    </span>
  );
}
