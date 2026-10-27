import { forwardRef, useId, useRef, useState, type ClipboardEvent, type KeyboardEvent, type ReactNode } from "react";
import { normalizePersian, toFaDigits } from "@kashi-ui/persian";
import { Badge, type BadgeTone } from "./Badge.js";
import { cx } from "./cx.js";
import { Field, describedBy } from "./Field.js";
import { mergeRefs } from "./utils.js";

export interface TagInputProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  value?: string[];
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  /** کلیدهایی که برچسب را ثبت می‌کنند @default ["Enter", ",", "،"] */
  separators?: string[];
  /** بررسی هر برچسب؛ متن خطا برمی‌گرداند یا undefined */
  validate?: (tag: string) => string | undefined;
  /** بیشترین تعداد */
  max?: number;
  /** @default false */
  allowDuplicates?: boolean;
  tone?: BadgeTone;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  labels?: { added?: (t: string) => string; removed?: (t: string) => string; remove?: (t: string) => string; max?: (n: number) => string; duplicate?: string };
}

/** ورود چند مقدار، مثل مهارت‌ها یا ایمیل‌ها؛ Enter یا ویرگول (, یا ،) ثبت می‌کند و Backspace آخری را حذف می‌کند */
export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(function TagInput(
  {
    label, hint, error, value, defaultValue = [], onChange, placeholder, separators = ["Enter", ",", "،"], validate, max,
    allowDuplicates = false, tone = "brand", disabled, name, id, className, labels = {},
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [inner, setInner] = useState<string[]>(defaultValue);
  const tags = value !== undefined ? value : inner;
  const [text, setText] = useState("");
  const [localError, setLocalError] = useState<string>();
  const [announce, setAnnounce] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    added = (t) => `${t} اضافه شد`, removed = (t) => `${t} حذف شد`, remove = (t) => `حذف ${t}`,
    max: maxMsg = (n) => `حداکثر ${toFaDigits(n)} مورد`, duplicate = "این مورد قبلاً اضافه شده است.",
  } = labels;

  const set = (next: string[]) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  /** چند برچسب را یکجا اضافه می‌کند؛ اگر یکی نامعتبر بود، متنش در فیلد می‌ماند */
  const addMany = (raw: string[]) => {
    let next = [...tags];
    for (const r of raw) {
      const t = normalizePersian(r).trim();
      if (!t) continue;
      if (max !== undefined && next.length >= max) return fail(maxMsg(max), t);
      if (!allowDuplicates && next.includes(t)) return fail(duplicate, t);
      const err = validate?.(t);
      if (err) return fail(err, t);
      next = [...next, t];
      setAnnounce(added(t));
    }
    set(next);
    setText("");
    setLocalError(undefined);
    function fail(msg: string, t: string) {
      set(next);
      setText(t);
      setLocalError(msg);
    }
  };

  const removeAt = (i: number) => {
    const t = tags[i];
    set(tags.filter((_, j) => j !== i));
    setAnnounce(removed(t));
    inputRef.current?.focus();
  };

  const singleSeps = separators.filter((s) => s.length === 1).map((s) => `\\${s}`).join("");

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (separators.includes(e.key) && text.trim()) {
      e.preventDefault();
      addMany([text]);
    } else if (e.key === "Backspace" && !text && tags.length) {
      removeAt(tags.length - 1);
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const data = e.clipboardData.getData("text");
    const parts = data.split(new RegExp(`[${singleSeps}\\n\\t]`));
    if (parts.length > 1) {
      e.preventDefault();
      addMany(parts);
    }
  };

  const shownError = error ?? localError;

  return (
    <Field id={inputId} label={label} hint={hint} error={shownError} className={className}>
      <div className="k-tag-input" data-invalid={shownError ? "" : undefined} onClick={() => inputRef.current?.focus()}>
        {tags.map((t, i) => (
          <Badge key={`${t}-${i}`} tone={tone} onRemove={disabled ? undefined : () => removeAt(i)} removeLabel={remove(t)}>{t}</Badge>
        ))}
        <input
          ref={mergeRefs(ref, inputRef)}
          id={inputId}
          className="k-tag-input__control"
          value={text}
          placeholder={tags.length ? undefined : placeholder}
          disabled={disabled}
          aria-invalid={shownError ? true : undefined}
          aria-describedby={describedBy(inputId, hint, shownError)}
          onChange={(e) => {
            const v = e.target.value;
            setLocalError(undefined);
            // صفحه‌کلید موبایل و IME رویداد کلید نمی‌فرستند؛ جداکننده را در متن هم پیدا کن
            const parts = v.split(new RegExp(`[${singleSeps}]`));
            if (singleSeps && parts.length > 1) {
              const rest = parts.pop() ?? "";
              addMany(parts);
              if (rest) setText(rest);
            } else setText(v);
          }}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onBlur={() => text.trim() && addMany([text])}
        />
      </div>
      <span className="k-sr-only" aria-live="polite">{announce}</span>
      {name && tags.map((t, i) => <input key={i} type="hidden" name={name} value={t} />)}
    </Field>
  );
});
