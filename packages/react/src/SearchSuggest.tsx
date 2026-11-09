"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "./cx.js";
import { useKashi } from "./KashiProvider.js";
import { useIsomorphicLayoutEffect } from "./utils.js";

export interface SearchSuggestProps {
  value?: string;
  defaultValue?: string;
  onChange?: (query: string) => void;
  /** با Enter، انتخاب پیشنهاد یا زدن یک جستجوی اخیر/پرطرفدار */
  onSearch?: (query: string) => void;
  /** جستجوهای اخیر (کنترل‌شده)؛ یا به‌جایش storageKey بدهید تا خودکار در مرورگر ذخیره شوند */
  recent?: string[];
  onClearRecent?: () => void;
  /** کلید localStorage برای ذخیرهٔ خودکار جستجوهای اخیر (حداکثر ۸ مورد) */
  storageKey?: string;
  /** جستجوهای پرطرفدار، با آیکون روند */
  popular?: string[];
  /** پیشنهادها هنگام تایپ؛ آرایه (خودکار فیلتر می‌شود) یا تابعی که برای هر عبارت فهرست می‌دهد */
  suggestions?: string[] | ((query: string) => string[]);
  placeholder?: string;
  /** برچسب برای صفحه‌خوان @default «جستجو» */
  label?: string;
  name?: string;
  className?: string;
  labels?: { recent?: ReactNode; popular?: ReactNode; clear?: ReactNode };
}

const norm = (s: string) => s.replace(/[يى]/g, "ی").replace(/ك/g, "ک").replace(/[‌\s]+/g, " ").trim().toLowerCase();

const SearchIcon = () => <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><circle cx="9.1" cy="9.1" r="6.2" /><path d="m14 14 3.3 3.3" /></svg>;
const TrendIcon = () => <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m2.75 13.5 4.6-4.6 3.2 3.2 6.2-6.2M12.75 5.9h4v4" /></svg>;
const HistoryIcon = () => <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.3 10a6.7 6.7 0 1 0 1.9-4.7M3.2 2.9v2.6h2.6M10 6.6V10l2.3 1.5" /></svg>;

/** جعبهٔ جستجو با جستجوهای اخیر و پرطرفدار و پیشنهاد هنگام تایپ (الگوی فروشگاه‌های اینترنتی) */
export function SearchSuggest({
  value, defaultValue, onChange, onSearch, recent, onClearRecent, storageKey, popular = [], suggestions,
  placeholder, label, name, className, labels = {},
}: SearchSuggestProps) {
  const { messages: M } = useKashi();
  const id = useId();
  const listId = `${id}-panel`;
  const [inner, setInner] = useState(defaultValue ?? "");
  const q = value ?? inner;
  const setQ = (s: string) => { if (value === undefined) setInner(s); onChange?.(s); };

  // جستجوهای اخیر: کنترل‌شده با recent، یا ذخیرهٔ خودکار با storageKey
  const [stored, setStored] = useState<string[]>([]);
  useEffect(() => {
    if (!storageKey) return;
    try { setStored(JSON.parse(localStorage.getItem(storageKey) ?? "[]")); } catch { /* حالت خصوصی */ }
  }, [storageKey]);
  const history = recent ?? stored;
  const remember = (s: string) => {
    if (!storageKey || recent) return;
    const next = [s, ...stored.filter((x) => norm(x) !== norm(s))].slice(0, 8);
    setStored(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* حالت خصوصی */ }
  };
  const clearHistory = () => {
    if (storageKey && !recent) { setStored([]); try { localStorage.removeItem(storageKey); } catch { /* */ } }
    onClearRecent?.();
  };

  const list = useMemo(() => {
    if (!q.trim() || !suggestions) return [];
    if (typeof suggestions === "function") return suggestions(q).slice(0, 8);
    const n = norm(q);
    return suggestions.filter((s) => norm(s).includes(n)).slice(0, 8);
  }, [q, suggestions]);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const showList = list.length > 0;
  const showIdle = !q.trim() && (history.length > 0 || popular.length > 0);
  const visible = open && (showList || showIdle);

  const submit = (s: string) => {
    const t = s.trim();
    if (!t) return;
    setQ(t);
    remember(t);
    onSearch?.(t);
    setOpen(false);
    setActive(-1);
  };

  // پنل با Popover API در لایهٔ بالا باز می‌شود تا ظرف‌های overflow: hidden آن را نبُرند
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const place = useCallback(() => {
    const r = boxRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 8, left: r.left, width: r.width });
  }, []);
  useIsomorphicLayoutEffect(() => {
    const el = panelRef.current as (HTMLDivElement & { showPopover?: () => void; hidePopover?: () => void }) | null;
    if (!visible) { if (el?.matches?.(":popover-open")) el.hidePopover?.(); return; }
    if (el?.showPopover && !el.matches(":popover-open")) el.showPopover();
    place();
    addEventListener("resize", place);
    addEventListener("scroll", place, true);
    return () => { removeEventListener("resize", place); removeEventListener("scroll", place, true); };
  }, [visible, place]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !boxRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);
  useEffect(() => setActive(-1), [q]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") { if (open) { e.preventDefault(); setOpen(false); } else if (q) setQ(""); return; }
    if (!showList) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => (a + 1) % list.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a <= 0 ? list.length - 1 : a - 1)); }
  };
  const onSubmit = (e: FormEvent) => { e.preventDefault(); submit(active >= 0 && list[active] ? list[active] : q); };

  const chip = (s: string, kind: "recent" | "popular") => (
    <li key={`${kind}-${s}`}>
      <button type="button" className="k-search-suggest__chip" onMouseDown={(e) => e.preventDefault()} onClick={() => submit(s)}>
        {kind === "popular" ? <TrendIcon /> : <HistoryIcon />}{s}
      </button>
    </li>
  );

  const highlight = (s: string) => {
    const i = norm(s).indexOf(norm(q));
    if (i < 0 || s.length !== norm(s).length) return s;
    return <>{s.slice(0, i)}<mark>{s.slice(i, i + q.trim().length)}</mark>{s.slice(i + q.trim().length)}</>;
  };

  return (
    <form role="search" className={cx("k-search-suggest", className)} onSubmit={onSubmit} data-open={visible || undefined}>
      <div className="k-search-suggest__box" ref={boxRef}>
        <SearchIcon />
        <input
          ref={inputRef}
          type="search"
          name={name}
          className="k-search-suggest__input"
          value={q}
          placeholder={placeholder}
          aria-label={label ?? M.searchSuggest.label}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={visible}
          aria-controls={listId}
          aria-activedescendant={visible && showList && active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          enterKeyHint="search"
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onKeyDown={onKeyDown}
        />
      </div>
      <div
        id={listId}
        ref={panelRef}
        className="k-search-suggest__panel"
        hidden={!visible}
        {...({ popover: "manual" } as Record<string, string>)}
        style={pos ? { position: "fixed", inset: "auto", margin: 0, top: pos.top, left: pos.left, width: pos.width } : undefined}
        onKeyDown={(e) => { if (e.key === "Escape") { setOpen(false); inputRef.current?.focus(); } }}
      >
        {showList ? (
          <ul role="listbox" aria-label={M.searchSuggest.suggestions} className="k-search-suggest__list">
            {list.map((s, i) => (
              <li key={s} id={`${listId}-${i}`} role="option" aria-selected={i === active} className="k-option" data-active={i === active || undefined}
                onMouseDown={(e) => e.preventDefault()} onPointerMove={() => setActive(i)} onClick={() => submit(s)}>
                <SearchIcon /><span className="k-option__label">{highlight(s)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <>
            {history.length > 0 && (
              <section className="k-search-suggest__section">
                <div className="k-search-suggest__head">
                  <b>{labels.recent ?? M.searchSuggest.recent}</b>
                  <button type="button" className="k-btn k-btn--link k-btn--sm" onMouseDown={(e) => e.preventDefault()} onClick={clearHistory}>{labels.clear ?? M.searchSuggest.clear}</button>
                </div>
                <ul className="k-search-suggest__chips">{history.map((s) => chip(s, "recent"))}</ul>
              </section>
            )}
            {popular.length > 0 && (
              <section className="k-search-suggest__section">
                <div className="k-search-suggest__head"><b>{labels.popular ?? M.searchSuggest.popular}</b></div>
                <ul className="k-search-suggest__chips">{popular.map((s) => chip(s, "popular"))}</ul>
              </section>
            )}
          </>
        )}
      </div>
    </form>
  );
}
