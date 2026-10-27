import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { toFaDigits } from "@kashi-ui/persian";
import { Badge } from "./Badge.js";
import { defaultFilter, highlight, type ComboboxOption } from "./Combobox.js";
import { Field, describedBy } from "./Field.js";
import { cx } from "./cx.js";

export interface MultiSelectProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  options: ComboboxOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  /** بیشترین تعداد انتخاب */
  max?: number;
  filter?: (option: ComboboxOption, query: string) => boolean;
  /** @default "نتیجه‌ای پیدا نشد." */
  emptyMessage?: ReactNode;
  disabled?: boolean;
  /** با name، یک فیلد پنهان برای هر مقدار */
  name?: string;
  id?: string;
  className?: string;
  labels?: { remove?: (label: string) => string; selected?: (n: number) => string; max?: (n: number) => string; clear?: string };
}

const Check = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 10.5 3.2 3L15 7" /></svg>;

/**
 * انتخاب چند گزینه با جستجو؛ انتخاب‌ها به‌شکل برچسب داخل فیلد.
 * ↑↓ حرکت، Enter انتخاب یا لغو انتخاب، Backspace در فیلد خالی آخرین برچسب را حذف می‌کند، Esc بستن.
 */
export function MultiSelect({
  label, hint, error, options, value, defaultValue = [], onChange, placeholder, max, filter = defaultFilter,
  emptyMessage = "نتیجه‌ای پیدا نشد.", disabled, name, id, className, labels = {},
}: MultiSelectProps) {
  const {
    remove = (l) => `حذف ${l}`, selected: selectedLabel = (n) => `${toFaDigits(n)} مورد انتخاب شده`,
    max: maxLabel = (n) => `حداکثر ${toFaDigits(n)} مورد`, clear = "پاک کردن همه",
  } = labels;
  const autoId = useId();
  const inputId = id ?? autoId;
  const listId = `${inputId}-list`;
  const [inner, setInner] = useState(defaultValue);
  const chosen = value ?? inner;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [announce, setAnnounce] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const filtered = useMemo(() => options.filter((o) => filter(o, query)), [options, query, filter]);
  const full = max !== undefined && chosen.length >= max;

  const set = (next: string[]) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };
  const toggle = (o: ComboboxOption) => {
    if (o.disabled) return;
    const on = chosen.includes(o.value);
    if (!on && full) return setAnnounce(maxLabel(max!));
    set(on ? chosen.filter((v) => v !== o.value) : [...chosen, o.value]);
    setAnnounce(`${o.label} ${on ? "حذف شد" : "انتخاب شد"}`);
    setQuery("");
  };
  const move = (d: number) => {
    const en = filtered.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);
    if (!en.length) return;
    const p = en.indexOf(active);
    setActive(en[(p + d + en.length) % en.length]);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); open ? move(1) : (setOpen(true), setActive(0)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); open ? move(-1) : setOpen(true); }
    else if (e.key === "Enter" && open && filtered[active]) { e.preventDefault(); toggle(filtered[active]); }
    else if (e.key === "Escape" && open) { e.preventDefault(); setOpen(false); }
    else if (e.key === "Backspace" && !query && chosen.length) {
      const last = options.find((o) => o.value === chosen[chosen.length - 1]);
      set(chosen.slice(0, -1));
      if (last) setAnnounce(`${last.label} حذف شد`);
    }
  };
  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v;

  return (
    <Field id={inputId} label={label} hint={hint} error={error} className={className}>
      <div
        ref={wrap}
        className="k-combobox k-multiselect"
        data-open={open ? "" : undefined}
        onBlur={(e) => !wrap.current?.contains(e.relatedTarget as Node) && setOpen(false)}
      >
        <div className="k-tag-input" data-invalid={error ? "" : undefined} onClick={() => input.current?.focus()}>
          {chosen.map((v) => (
            <Badge key={v} tone="brand" onRemove={disabled ? undefined : () => set(chosen.filter((x) => x !== v))} removeLabel={remove(labelOf(v))}>{labelOf(v)}</Badge>
          ))}
          <input
            ref={input}
            id={inputId}
            className="k-tag-input__control"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={listId}
            aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
            aria-describedby={describedBy(inputId, hint, error, `${inputId}-count`)}
            aria-invalid={error ? true : undefined}
            autoComplete="off"
            placeholder={chosen.length ? undefined : placeholder}
            disabled={disabled}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActive(0);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKey}
          />
          {chosen.length > 1 && !disabled && (
            <button type="button" className="k-input__action" aria-label={clear} onClick={() => { set([]); input.current?.focus(); }}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden="true"><path d="m6 6 8 8M14 6l-8 8" /></svg>
            </button>
          )}
        </div>
        <ul id={listId} role="listbox" aria-multiselectable="true" aria-label={typeof label === "string" ? label : undefined} className="k-listbox" hidden={!open} style={{ insetBlockStart: "calc(100% + 6px)" }}>
          {filtered.length === 0 && <li className="k-listbox__empty" role="presentation">{emptyMessage}</li>}
          {filtered.map((o, i) => {
            const on = chosen.includes(o.value);
            return (
              <li
                key={o.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={on}
                aria-disabled={o.disabled || (!on && full) || undefined}
                data-active={i === active ? "" : undefined}
                className="k-option k-option--check"
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => toggle(o)}
                onPointerMove={() => active !== i && setActive(i)}
              >
                <span className="k-multiselect__box" aria-hidden="true">{on && <Check />}</span>
                {o.icon}
                <span className="k-option__body">
                  <span>{highlight(o.label, query)}</span>
                  {o.description && <span className="k-option__desc">{o.description}</span>}
                </span>
              </li>
            );
          })}
        </ul>
        <span id={`${inputId}-count`} className="k-sr-only">{selectedLabel(chosen.length)}</span>
        <span className="k-sr-only" aria-live="polite">{announce}</span>
        {name && chosen.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
      </div>
    </Field>
  );
}
