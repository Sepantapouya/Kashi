import {
  Children, cloneElement, createContext, isValidElement, useContext, useEffect, useId, useRef, useState,
  type KeyboardEvent, type ReactElement, type ReactNode,
} from "react";
import { cx } from "./cx.js";

const MenuCtx = createContext<{ close: (focusTrigger?: boolean) => void } | null>(null);

export interface DropdownMenuProps {
  /** دکمه‌ای که منو را باز می‌کند */
  trigger: ReactElement;
  /** نام منو برای صفحه‌خوان؛ پیش‌فرض متن دکمه */
  label?: string;
  /** هم‌ترازی با لبهٔ ابتدا یا انتهای دکمه @default "start" */
  align?: "start" | "end";
  children: ReactNode;
}

const items = (menu: HTMLElement | null) =>
  [...(menu?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])') ?? [])];

/**
 * منوی کشویی با الگوی Menu Button در WAI-ARIA:
 * Enter، Space یا ↓ باز می‌کند و اولین گزینه را فوکوس می‌کند، ↑ آخرین را؛
 * ↑↓ و Home/End حرکت، حرف اول برای پرش، Esc بستن و برگشت به دکمه، Tab بستن.
 */
export function DropdownMenu({ trigger, label, align = "start", children }: DropdownMenuProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const focusOnOpen = useRef<"first" | "last">("first");
  const triggerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);

  const close = (focusTrigger = true) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const list = items(menuRef.current);
    (focusOnOpen.current === "last" ? list[list.length - 1] : list[0])?.focus();
    const onDown = (e: PointerEvent) => {
      if (!anchorRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const openWith = (where: "first" | "last") => {
    focusOnOpen.current = where;
    setOpen(true);
  };

  const onMenuKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const list = items(menuRef.current);
    const i = list.indexOf(document.activeElement as HTMLElement);
    const go = (j: number) => list[(j + list.length) % list.length]?.focus();
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(list.length - 1);
    else if (e.key === "Escape") close();
    else if (e.key === "Tab") return setOpen(false);
    else if (e.key.length === 1 && /\S/.test(e.key)) {
      // پرش با حرف اول
      const k = e.key.toLowerCase();
      const start = i + 1;
      const hit = [...list.slice(start), ...list.slice(0, start)].find((el) => el.textContent?.trim().toLowerCase().startsWith(k));
      hit?.focus();
    } else return;
    e.preventDefault();
  };

  const t = isValidElement<Record<string, unknown>>(trigger)
    ? cloneElement(trigger, {
        ref: triggerRef,
        id: `${id}-trigger`,
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": open ? `${id}-menu` : undefined,
        onClick: () => (open ? close(false) : openWith("first")),
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openWith(e.key === "ArrowUp" ? "last" : "first");
          }
        },
      })
    : trigger;

  return (
    <span className="k-menu-anchor" ref={anchorRef}>
      {t}
      <MenuCtx.Provider value={{ close }}>
        <ul
          ref={menuRef}
          id={`${id}-menu`}
          role="menu"
          aria-label={label}
          aria-labelledby={label ? undefined : `${id}-trigger`}
          className={cx("k-menu", align === "end" && "k-menu--end")}
          hidden={!open}
          onKeyDown={onMenuKey}
        >
          {Children.map(children, (c) => c)}
        </ul>
      </MenuCtx.Provider>
    </span>
  );
}

export interface MenuItemProps {
  onSelect?: () => void;
  icon?: ReactNode;
  /** میان‌بر نمایشی، مثل "Ctrl+D" */
  shortcut?: string;
  /** «danger» برای عملیات مخرب */
  tone?: "default" | "danger";
  disabled?: boolean;
  /** لینک به‌جای عمل */
  href?: string;
  /** گزینهٔ تیک‌دار (menuitemcheckbox)، مثل «نمایش ستون تاریخ»؛ منو پس از انتخاب باز می‌ماند */
  checked?: boolean;
  children: ReactNode;
}

export function MenuItem({ onSelect, icon, shortcut, tone = "default", disabled, href, checked, children }: MenuItemProps) {
  const checkable = checked !== undefined;
  const ctx = useContext(MenuCtx);
  const cls = cx("k-menu__item", tone === "danger" && "k-menu__item--danger");
  const content = (
    <>
      {checkable && (
        <span className="k-menu__check" aria-hidden="true">
          {checked && <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m5 10.5 3.2 3L15 7" /></svg>}
        </span>
      )}
      {icon}
      <span>{children}</span>
      {shortcut && <span className="k-menu__shortcut" aria-hidden="true">{shortcut}</span>}
    </>
  );
  const select = () => {
    if (disabled) return;
    onSelect?.();
    if (!checkable) ctx?.close();
  };
  return (
    <li role="none">
      {href && !disabled ? (
        <a role="menuitem" tabIndex={-1} className={cls} href={href} onClick={() => ctx?.close(false)}>{content}</a>
      ) : (
        <button type="button" role={checkable ? "menuitemcheckbox" : "menuitem"} aria-checked={checkable ? checked : undefined} tabIndex={-1} className={cls} aria-disabled={disabled || undefined} onClick={select}>{content}</button>
      )}
    </li>
  );
}

export const MenuSeparator = () => <li role="separator" className="k-menu__separator" />;
export const MenuLabel = ({ children }: { children: ReactNode }) => <li role="presentation" className="k-menu__label">{children}</li>;
