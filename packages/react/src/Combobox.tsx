import { forwardRef, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { normalizePersian, toFaDigits } from "@kashi-ui/persian";
import { cx } from "./cx.js";
import { Field, describedBy } from "./Field.js";
import { mergeRefs } from "./utils.js";

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
  /** نام گروه برای دسته‌بندی گزینه‌ها */
  group?: string;
  /** کلمه‌های اضافه برای جستجو، مثل نام انگلیسی */
  keywords?: string[];
}

/** متن یکدست برای جستجو: ي/ی، ك/ک، ارقام، حروف کوچک */
export const searchText = (s: string) => normalizePersian(s, { digits: "latin" }).toLowerCase();

export function defaultFilter(option: ComboboxOption, query: string): boolean {
  const q = searchText(query.trim());
  if (!q) return true;
  return [option.label, option.description ?? "", ...(option.keywords ?? [])].some((t) => searchText(t).includes(q));
}

/** بخش منطبق با جستجو را با <mark> برجسته می‌کند */
export function highlight(text: string, query: string): ReactNode {
  const q = searchText(query.trim());
  if (!q) return text;
  const i = searchText(text).indexOf(q);
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

const Check = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 10.5 3.2 3L15 7" /></svg>
);

export interface ComboboxProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  options: ComboboxOption[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /** وقتی متن جستجو عوض می‌شود؛ برای جستجوی سمت سرور */
  onInputChange?: (query: string) => void;
  placeholder?: string;
  /** جستجوی سفارشی؛ پیش‌فرض با یکدست‌سازی فارسی */
  filter?: (option: ComboboxOption, query: string) => boolean;
  /** @default "نتیجه‌ای پیدا نشد." */
  emptyMessage?: ReactNode;
  /** نمایش اسپینر، مثلاً هنگام جستجوی سمت سرور */
  loading?: boolean;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  /** @default (n) => «n نتیجه» */
  resultsLabel?: (count: number) => string;
}

/**
 * جستجو و انتخاب با الگوی Combobox در WAI-ARIA:
 * تایپ فهرست را فیلتر می‌کند، ↑↓ حرکت، Enter انتخاب، Esc بستن (و در حالت بسته، پاک کردن).
 * جستجو «علي» و «علی» را یکی می‌داند.
 */
export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  {
    label, hint, error, options, value, defaultValue = null, onChange, onInputChange, placeholder, filter = defaultFilter,
    emptyMessage = "نتیجه‌ای پیدا نشد.", loading, required, disabled, name, id, className,
    resultsLabel = (n) => `${toFaDigits(n)} نتیجه`,
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const listId = `${inputId}-list`;
  const [inner, setInner] = useState<string | null>(defaultValue);
  const selected = value !== undefined ? value : inner;
  const selectedOption = options.find((o) => o.value === selected) ?? null;
  const [query, setQuery] = useState(selectedOption?.label ?? "");
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // وقتی مقدار از بیرون عوض شد، متن فیلد هم هماهنگ شود
  useEffect(() => {
    if (!typing) setQuery(selectedOption?.label ?? "");
  }, [selectedOption?.label]);

  const filtered = useMemo(() => (typing ? options.filter((o) => filter(o, query)) : options), [options, query, typing, filter]);
  const enabled = filtered.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);

  const commit = (o: ComboboxOption | null) => {
    if (value === undefined) setInner(o?.value ?? null);
    onChange?.(o?.value ?? null);
    setQuery(o?.label ?? "");
    setTyping(false);
    setOpen(false);
    setActive(-1);
  };

  const openList = (at: "first" | "last" | "selected" = "selected") => {
    if (disabled) return;
    setOpen(true);
    const sel = filtered.findIndex((o) => o.value === selected);
    setActive(at === "last" ? enabled[enabled.length - 1] ?? -1 : at === "first" || sel < 0 ? enabled[0] ?? -1 : sel);
  };

  const move = (delta: number) => {
    if (!enabled.length) return;
    const pos = enabled.indexOf(active);
    setActive(enabled[(pos + delta + enabled.length) % enabled.length]);
  };

  // گزینهٔ فعال همیشه دیده شود
  useEffect(() => {
    if (active < 0) return;
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, listId]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      open ? move(1) : openList(e.altKey ? "selected" : "first");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      open ? move(-1) : openList("last");
    } else if (e.key === "Enter" && open && active >= 0) {
      e.preventDefault();
      commit(filtered[active]);
    } else if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        setOpen(false);
        setTyping(false);
        setQuery(selectedOption?.label ?? "");
      } else if (query) {
        e.preventDefault();
        commit(null);
      }
    } else if (e.key === "Home" || e.key === "End") {
      if (!open) return;
      e.preventDefault();
      setActive(e.key === "Home" ? enabled[0] : enabled[enabled.length - 1]);
    }
  };

  let lastGroup: string | undefined;

  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required} className={className}>
      <div
        ref={wrapRef}
        className="k-combobox"
        data-open={open ? "" : undefined}
        onBlur={(e) => {
          if (wrapRef.current?.contains(e.relatedTarget as Node)) return;
          setOpen(false);
          // متن نیمه‌کاره به گزینهٔ انتخاب‌شده برمی‌گردد
          if (typing) {
            setTyping(false);
            setQuery(selectedOption?.label ?? "");
          }
        }}
      >
        <div className={cx("k-input")} data-state={error ? "invalid" : undefined}>
          <input
            ref={mergeRefs(ref, inputRef)}
            id={inputId}
            className="k-input__control"
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={listId}
            aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(inputId, hint, error)}
            autoComplete="off"
            placeholder={placeholder}
            value={query}
            required={required}
            disabled={disabled}
            onChange={(e) => {
              setQuery(e.target.value);
              setTyping(true);
              setOpen(true);
              setActive(-1);
              onInputChange?.(e.target.value);
            }}
            onKeyDown={onKeyDown}
            onClick={() => !open && openList()}
          />
          {loading && <span className="k-input__addon"><span className="k-spinner k-spinner--sm" aria-hidden="true" /></span>}
          <button
            type="button"
            tabIndex={-1}
            className="k-input__action k-combobox__toggle"
            aria-label="نمایش گزینه‌ها"
            disabled={disabled}
            onClick={() => {
              if (open) setOpen(false);
              else {
                setTyping(false);
                openList();
                inputRef.current?.focus();
              }
            }}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 8 4 4 4-4" /></svg>
          </button>
        </div>
        <ul id={listId} role="listbox" aria-labelledby={label ? undefined : inputId} aria-label={typeof label === "string" ? label : undefined} className="k-listbox" hidden={!open} style={{ insetBlockStart: "calc(100% + 6px)" }}>
          {filtered.length === 0 && <li className="k-listbox__empty" role="presentation">{loading ? "در حال جستجو…" : emptyMessage}</li>}
          {filtered.map((o, i) => {
            const header = o.group && o.group !== lastGroup ? o.group : null;
            lastGroup = o.group;
            return [
              header && <li key={`g-${header}`} role="presentation" className="k-listbox__group">{header}</li>,
              <li
                key={o.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={o.value === selected}
                aria-disabled={o.disabled || undefined}
                data-active={i === active ? "" : undefined}
                className="k-option"
                onPointerDown={(e) => e.preventDefault() /* فوکوس در فیلد بماند */}
                onClick={() => !o.disabled && commit(o)}
                onPointerMove={() => !o.disabled && active !== i && setActive(i)}
              >
                {o.icon}
                <span className="k-option__body">
                  <span>{highlight(o.label, typing ? query : "")}</span>
                  {o.description && <span className="k-option__desc">{o.description}</span>}
                </span>
                {o.value === selected && <span className="k-option__check"><Check /></span>}
              </li>,
            ];
          })}
        </ul>
        {/* تعداد نتایج برای صفحه‌خوان */}
        <span className="k-sr-only" aria-live="polite">{open && typing ? resultsLabel(filtered.length) : ""}</span>
        {name && <input type="hidden" name={name} value={selected ?? ""} />}
      </div>
    </Field>
  );
});
