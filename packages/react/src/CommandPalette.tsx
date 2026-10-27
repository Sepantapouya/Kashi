import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { toFaDigits } from "@kashi-ui/persian";
import { defaultFilter, highlight, type ComboboxOption } from "./Combobox.js";
import { cx } from "./cx.js";

export interface CommandItem {
  id: string;
  label: string;
  group?: string;
  icon?: ReactNode;
  /** میان‌بر نمایشی، مثل "Ctrl+N" */
  shortcut?: string;
  /** کلمه‌های اضافه برای جستجو */
  keywords?: string[];
  description?: string;
  onSelect?: () => void;
  /** به‌جای onSelect، رفتن به یک آدرس */
  href?: string;
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandItem[];
  /** باز کردن با Ctrl+K یا ⌘K @default true */
  shortcut?: boolean;
  placeholder?: string;
  emptyMessage?: ReactNode;
  labels?: { title?: string; navigate?: string; select?: string; close?: string; results?: (n: number) => string };
  className?: string;
}

/**
 * پالت فرمان: جستجوی سریع در عمل‌ها و صفحه‌ها با Ctrl+K.
 * پنجره روی <dialog> بومی است (تلهٔ فوکوس و Esc) و فهرست با الگوی combobox/listbox پیمایش می‌شود.
 */
export function CommandPalette({
  open, onOpenChange, items, shortcut = true, placeholder = "جستجوی دستور یا صفحه…", emptyMessage = "دستوری پیدا نشد.",
  labels = {}, className,
}: CommandPaletteProps) {
  const id = useId();
  const listId = `${id}-list`;
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const opener = useRef<Element | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const { title = "پالت فرمان", navigate = "حرکت", select = "انتخاب", close = "بستن", results = (n: number) => `${toFaDigits(n)} نتیجه` } = labels;

  // میان‌بر سراسری
  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K" || e.code === "KeyK")) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shortcut, open, onOpenChange]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement;
      setQuery("");
      setActive(0);
      d.showModal();
      inputRef.current?.focus();
    } else if (!open && d.open) d.close();
  }, [open]);

  const filtered = useMemo(
    () => items.filter((it) => defaultFilter({ value: it.id, label: it.label, description: it.description, keywords: it.keywords } as ComboboxOption, query)),
    [items, query],
  );

  useEffect(() => {
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, listId]);

  const run = (it: CommandItem | undefined) => {
    if (!it) return;
    onOpenChange(false);
    if (it.href) window.location.href = it.href;
    else it.onSelect?.();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const n = filtered.length;
    if (!n) return;
    if (e.key === "ArrowDown") setActive((a) => (a + 1) % n);
    else if (e.key === "ArrowUp") setActive((a) => (a - 1 + n) % n);
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(n - 1);
    else if (e.key === "Enter") run(filtered[active]);
    else return;
    e.preventDefault();
  };

  let lastGroup: string | undefined;

  return (
    <dialog
      ref={ref}
      className={cx("k-dialog", "k-command", className)}
      aria-label={title}
      onClose={() => {
        onOpenChange(false);
        (opener.current as HTMLElement | null)?.focus?.();
      }}
      onCancel={(e) => {
        e.preventDefault();
        onOpenChange(false);
      }}
      onClick={(e) => e.target === ref.current && onOpenChange(false)}
    >
      <div className="k-input">
        <span className="k-input__addon">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" aria-hidden="true"><circle cx="9" cy="9" r="5.5" /><path d="m13.5 13.5 3 3" /></svg>
        </span>
        <input
          ref={inputRef}
          className="k-input__control"
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={filtered.length ? `${listId}-${active}` : undefined}
          aria-label={title}
          placeholder={placeholder}
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
        />
      </div>
      <ul id={listId} role="listbox" aria-label={title} className="k-listbox k-listbox--inline k-command__list">
        {filtered.length === 0 && <li role="presentation" className="k-listbox__empty">{emptyMessage}</li>}
        {filtered.map((it, i) => {
          const header = it.group && it.group !== lastGroup ? it.group : null;
          lastGroup = it.group;
          return [
            header && <li key={`g-${header}`} role="presentation" className="k-listbox__group">{header}</li>,
            <li
              key={it.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              data-active={i === active ? "" : undefined}
              className="k-option"
              onPointerDown={(e) => e.preventDefault()}
              onPointerMove={() => active !== i && setActive(i)}
              onClick={() => run(it)}
            >
              {it.icon}
              <span className="k-option__body">
                <span>{highlight(it.label, query)}</span>
                {it.description && <span className="k-option__desc">{it.description}</span>}
              </span>
              {it.shortcut && <span className="k-menu__shortcut" aria-hidden="true">{it.shortcut}</span>}
            </li>,
          ];
        })}
      </ul>
      <div className="k-command__footer" aria-hidden="true">
        <span><kbd className="k-kbd">↑</kbd><kbd className="k-kbd">↓</kbd>{navigate}</span>
        <span><kbd className="k-kbd">Enter</kbd>{select}</span>
        <span><kbd className="k-kbd">Esc</kbd>{close}</span>
      </div>
      <span className="k-sr-only" aria-live="polite">{query ? results(filtered.length) : ""}</span>
    </dialog>
  );
}
