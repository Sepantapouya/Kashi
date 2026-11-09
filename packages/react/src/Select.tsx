"use client";

import {
  Children, forwardRef, isValidElement, useCallback, useEffect, useId, useImperativeHandle, useMemo, useRef, useState,
  type ChangeEvent, type KeyboardEvent, type ReactElement, type ReactNode, type SelectHTMLAttributes,
} from "react";
import { cx } from "./cx.js";
import { Field, describedBy } from "./Field.js";
import { useIsomorphicLayoutEffect } from "./utils.js";

export interface SelectOption { value: string; label: ReactNode; disabled?: boolean }

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** گزینهٔ خالی اول، مثل «انتخاب کنید» */
  placeholder?: string;
  /** گزینه‌ها؛ یا به‌جای آن <option> و <optgroup> را به‌عنوان children بدهید */
  options?: SelectOption[];
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  fieldClassName?: string;
  /** فهرست بومی مرورگر به‌جای فهرست کاشی؛ برای فهرست‌های خیلی بلند یا وقتی انتخاب‌گر سیستم گوشی را می‌خواهید @default false */
  native?: boolean;
}

type Item = { kind: "option"; value: string; label: ReactNode; text: string; disabled?: boolean } | { kind: "group"; label: ReactNode };

const textOf = (node: ReactNode): string =>
  typeof node === "string" || typeof node === "number" ? String(node)
  : Array.isArray(node) ? node.map(textOf).join("")
  : isValidElement(node) ? textOf((node.props as { children?: ReactNode }).children) : "";

const norm = (s: string) => s.replace(/[يى]/g, "ی").replace(/ك/g, "ک").replace(/‌/g, " ").toLowerCase();

/** گزینه‌ها از options یا از <option>/<optgroup> فرزند */
function collect(options: SelectOption[] | undefined, children: ReactNode): Item[] {
  const out: Item[] = (options ?? []).map((o) => ({ kind: "option" as const, value: o.value, label: o.label, text: textOf(o.label), disabled: o.disabled }));
  const walk = (nodes: ReactNode) => Children.forEach(nodes, (child) => {
    if (!isValidElement(child)) return;
    const el = child as ReactElement<{ value?: string | number; children?: ReactNode; disabled?: boolean; label?: string }>;
    if (el.type === "option") out.push({ kind: "option", value: String(el.props.value ?? textOf(el.props.children)), label: el.props.children, text: textOf(el.props.children), disabled: el.props.disabled });
    else if (el.type === "optgroup") { out.push({ kind: "group", label: el.props.label }); walk(el.props.children); }
    else walk(el.props.children);
  });
  walk(children);
  return out;
}

const Chevron = () => (
  <svg className="k-select__chevron" viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 8 4 4 4-4" /></svg>
);
const Check = () => (
  <svg className="k-option__check" viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m4.5 10.5 3.5 3.5 7.5-8" /></svg>
);

/**
 * انتخاب از فهرست. نسخهٔ ۲: فهرست با ظاهر کاشی، صفحه‌کلید کامل (فلش‌ها، Home/End، Enter، Escape و تایپ حرف اول)
 * و یک <select> بومیِ پنهان زیرش، تا فرم، name، required، onChange و ref مثل قبل کار کنند.
 * برای انتخاب‌گر سیستم، native بدهید.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, placeholder, options, size = "md", id, required, className, fieldClassName, children, native = false, "aria-describedby": extra, ...rest },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const placeholderSelected = placeholder !== undefined && rest.value === undefined && rest.defaultValue === undefined;

  if (native) {
    return (
      <Field id={selectId} label={label} hint={hint} error={error} required={required} className={fieldClassName}>
        <div className={cx("k-select", size !== "md" && `k-select--${size}`, className)}>
          <select ref={ref} id={selectId} className="k-select__control" required={required} aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(selectId, hint, error, extra)} defaultValue={placeholderSelected ? "" : undefined} {...rest}>
            {placeholder !== undefined && <option value="" disabled>{placeholder}</option>}
            {options?.map((o) => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
            {children}
          </select>
        </div>
      </Field>
    );
  }
  return <CustomSelect {...{ selectId, label, hint, error, placeholder, options, size, required, className, fieldClassName, children, extra, placeholderSelected, rest }} forwardedRef={ref} />;
});

function CustomSelect({
  selectId, label, hint, error, placeholder, options, size, required, className, fieldClassName, children, extra, placeholderSelected, rest, forwardedRef,
}: {
  selectId: string; label?: ReactNode; hint?: ReactNode; error?: ReactNode; placeholder?: string; options?: SelectOption[]; size: "sm" | "md" | "lg";
  required?: boolean; className?: string; fieldClassName?: string; children?: ReactNode; extra?: string; placeholderSelected: boolean;
  rest: Omit<SelectHTMLAttributes<HTMLSelectElement>, "size">; forwardedRef: React.ForwardedRef<HTMLSelectElement>;
}) {
  const { value, defaultValue, onChange, disabled, name, form, autoComplete, onBlur, onFocus, ...other } = rest;
  const items = useMemo(() => collect(options, children), [options, children]);
  const opts = items.filter((i): i is Extract<Item, { kind: "option" }> => i.kind === "option");

  const nativeRef = useRef<HTMLSelectElement>(null);
  useImperativeHandle(forwardedRef, () => nativeRef.current as HTMLSelectElement);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = `${selectId}-list`;

  const controlled = value !== undefined;
  const [inner, setInner] = useState<string>(() => String(defaultValue ?? (placeholderSelected ? "" : opts.find((o) => !o.disabled)?.value ?? "")));
  const current = controlled ? String(value ?? "") : inner;
  const selected = opts.find((o) => o.value === current);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [up, setUp] = useState(false);
  const typed = useRef({ text: "", at: 0 });

  // انتخاب: مقدار select پنهان عوض و رویداد change واقعی فرستاده می‌شود؛ onChange همان رویداد بومی را می‌گیرد
  const choose = useCallback((v: string) => {
    const el = nativeRef.current;
    if (!controlled) setInner(v);
    if (el && el.value !== v) {
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")!.set!.call(el, v);
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }, [controlled]);

  const openList = (to?: number) => {
    if (disabled) return;
    const idx = to ?? Math.max(0, opts.findIndex((o) => o.value === current));
    setActive(idx);
    setOpen(true);
  };
  const close = (focus = true) => { setOpen(false); if (focus) triggerRef.current?.focus(); };

  // فهرست با Popover API در لایهٔ بالای صفحه باز می‌شود، پس داخل ظرف‌های overflow: hidden یا transform‌دار
  // (کارت، دیالوگ، جدول) بریده نمی‌شود و تم و جهت همان بخش را دارد. جایش نسبت به فیلد حساب می‌شود؛
  // اگر پایین جا نیست، بالای فیلد باز می‌شود
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left: number; width: number } | null>(null);
  const place = useCallback(() => {
    const t = triggerRef.current;
    if (!t) return;
    const r = t.getBoundingClientRect();
    const need = Math.min(288, (listRef.current?.scrollHeight ?? 0) + 8);
    const below = innerHeight - r.bottom;
    const flip = below < need && r.top > below;
    setUp(flip);
    setPos(flip ? { bottom: innerHeight - r.top + 6, left: r.left, width: r.width } : { top: r.bottom + 6, left: r.left, width: r.width });
  }, []);
  useIsomorphicLayoutEffect(() => {
    const el = listRef.current as (HTMLUListElement & { showPopover?: () => void; hidePopover?: () => void }) | null;
    if (!open) { if (el?.matches?.(":popover-open")) el.hidePopover?.(); return; }
    if (el?.showPopover && !el.matches(":popover-open")) el.showPopover();
    place();
    addEventListener("resize", place);
    addEventListener("scroll", place, true);
    return () => { removeEventListener("resize", place); removeEventListener("scroll", place, true); };
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!listRef.current?.contains(t) && !triggerRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const step = (from: number, dir: 1 | -1) => {
    for (let i = from + dir; i >= 0 && i < opts.length; i += dir) if (!opts[i].disabled) return i;
    return from;
  };
  const first = () => step(-1, 1), last = () => step(opts.length, -1);

  const typeahead = (key: string) => {
    const now = Date.now();
    typed.current.text = now - typed.current.at > 700 ? key : typed.current.text + key;
    typed.current.at = now;
    const q = norm(typed.current.text);
    const start = open ? active : opts.findIndex((o) => o.value === current);
    const order = [...opts.keys()].map((k) => (k + start + 1) % opts.length);
    const hit = order.find((i) => !opts[i].disabled && norm(opts[i].text).startsWith(q));
    if (hit === undefined) return;
    if (open) setActive(hit); else choose(opts[hit].value);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const k = e.key;
    if (!open) {
      if (k === "ArrowDown" || k === "ArrowUp" || k === "Enter" || k === " ") { e.preventDefault(); openList(k === "ArrowUp" ? undefined : undefined); return; }
      if (k === "Home") { e.preventDefault(); openList(first()); return; }
      if (k === "End") { e.preventDefault(); openList(last()); return; }
      if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) typeahead(k);
      return;
    }
    if (k === "ArrowDown") { e.preventDefault(); setActive((a) => step(a, 1)); }
    else if (k === "ArrowUp") { e.preventDefault(); setActive((a) => step(a, -1)); }
    else if (k === "Home" || k === "PageUp") { e.preventDefault(); setActive(first()); }
    else if (k === "End" || k === "PageDown") { e.preventDefault(); setActive(last()); }
    else if (k === "Enter" || k === " ") { e.preventDefault(); if (opts[active] && !opts[active].disabled) choose(opts[active].value); close(); }
    else if (k === "Escape") { e.preventDefault(); close(); }
    else if (k === "Tab") setOpen(false);
    else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) typeahead(k);
  };

  let index = -1;
  return (
    <Field id={selectId} label={label} hint={hint} error={error} required={required} className={fieldClassName}>
      <div className={cx("k-select", "k-select--custom", size !== "md" && `k-select--${size}`, className)} data-open={open || undefined}>
        <button
          ref={triggerRef}
          id={selectId}
          type="button"
          role="combobox"
          className="k-select__control"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy(selectId, hint, error, extra)}
          disabled={disabled}
          onClick={() => (open ? close(false) : openList())}
          onKeyDown={onKeyDown}
          onBlur={(e) => { if (!listRef.current?.contains(e.relatedTarget as Node)) setOpen(false); }}
          {...(other as Record<string, unknown>)}
        >
          <span className={cx("k-select__value", !selected && "k-select__value--placeholder")}>{selected ? selected.label : placeholder ?? " "}</span>
          <Chevron />
        </button>
        <ul id={listId} ref={listRef} role="listbox" aria-labelledby={selectId} className={cx("k-listbox", "k-select__list", up && "k-select__list--up")} hidden={!open} tabIndex={-1}
          {...({ popover: "manual" } as Record<string, string>)}
          style={pos ? { position: "fixed", insetBlock: "auto", top: pos.top, bottom: pos.bottom, left: pos.left, width: pos.width, right: "auto" } : undefined}>
          {items.map((it, i) => {
            if (it.kind === "group") return <li key={`g${i}`} role="presentation" className="k-listbox__group">{it.label}</li>;
            index += 1;
            const n = index;
            const isSel = it.value === current;
            return (
              <li
                key={it.value}
                id={`${listId}-${n}`}
                data-index={n}
                role="option"
                className="k-option"
                aria-selected={isSel}
                aria-disabled={it.disabled || undefined}
                data-active={n === active || undefined}
                onPointerMove={() => !it.disabled && setActive(n)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { if (it.disabled) return; choose(it.value); close(); }}
              >
                <span className="k-option__label">{it.label}</span>
                {isSel && <Check />}
              </li>
            );
          })}
        </ul>
        {/* select بومی برای فرم و onChange؛ دیده نمی‌شود و در ترتیب تب نیست */}
        <select
          ref={nativeRef}
          className="k-select__native"
          tabIndex={-1}
          aria-hidden="true"
          name={name}
          form={form}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          value={current}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => { if (!controlled) setInner(e.target.value); onChange?.(e); }}
          onFocus={(e) => { triggerRef.current?.focus(); onFocus?.(e); }}
          onBlur={onBlur}
          onInvalid={() => triggerRef.current?.focus()}
        >
          <option value="" />
          {opts.map((o) => <option key={o.value} value={o.value} disabled={o.disabled}>{o.text}</option>)}
        </select>
      </div>
    </Field>
  );
}
