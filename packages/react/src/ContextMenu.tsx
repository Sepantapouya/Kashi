import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { MenuCtx, items, menuKeyDown } from "./DropdownMenu.js";
import { cx } from "./cx.js";

export interface ContextMenuProps {
  /** ناحیه‌ای که راست‌کلیک روی آن منو را باز می‌کند */
  children: ReactNode;
  /** گزینه‌ها: MenuItem، MenuSeparator و MenuLabel */
  menu: ReactNode;
  /** نام منو برای صفحه‌خوان @default «گزینه‌ها» */
  label?: string;
  className?: string;
}

/**
 * منوی راست‌کلیک؛ با کیبورد هم: کلید ContextMenu یا Shift+F10 روی ناحیهٔ فوکوس‌شده.
 * همان گزینه‌ها و پیمایش منوی کشویی را دارد.
 */
export function ContextMenu({ children, menu, label = "گزینه‌ها", className }: ContextMenuProps) {
  const id = useId();
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const area = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const placed = useRef(false);

  const close = (focusBack = true) => {
    placed.current = false;
    setPos(null);
    if (focusBack) returnTo.current?.focus();
  };
  const openAt = (x: number, y: number) => {
    returnTo.current = (document.activeElement as HTMLElement) ?? area.current;
    setPos({ x, y });
  };

  useEffect(() => {
    const el = list.current!;
    const pop = el as HTMLElement & { showPopover?: () => void; hidePopover?: () => void };
    if (!pos) {
      if (el.matches?.(":popover-open")) pop.hidePopover?.();
      return;
    }
    if (pop.showPopover && !el.matches(":popover-open")) pop.showPopover();
    // یک بار جای‌گذاری: در RTL منو سمت چپ نشانگر باز می‌شود (مثل منوی بومی) و از صفحه بیرون نمی‌رود
    if (!placed.current) {
      placed.current = true;
      const r = el.getBoundingClientRect();
      const rtl = getComputedStyle(area.current!).direction === "rtl";
      let nx = rtl ? pos.x - r.width : pos.x;
      if (nx < 8) nx = rtl ? pos.x : 8;
      nx = Math.max(8, Math.min(nx, innerWidth - r.width - 8));
      const ny = Math.max(8, pos.y + r.height > innerHeight - 8 ? pos.y - r.height : pos.y);
      if (nx !== pos.x || ny !== pos.y) return setPos({ x: nx, y: Math.min(ny, innerHeight - r.height - 8) });
    }
    items(el)[0]?.focus({ preventScroll: true });
    const onDown = (e: PointerEvent) => !el.contains(e.target as Node) && close(false);
    const onScroll = () => close(false);
    document.addEventListener("pointerdown", onDown);
    // اسکرولی که همین حالا در جریان است منو را نبندد
    const t = setTimeout(() => addEventListener("scroll", onScroll, { passive: true, once: true }), 150);
    return () => {
      clearTimeout(t);
      document.removeEventListener("pointerdown", onDown);
      removeEventListener("scroll", onScroll);
    };
  }, [pos?.x, pos?.y]);

  return (
    <div
      ref={area}
      className={cx("k-context-area", className)}
      aria-haspopup="menu"
      aria-describedby={`${id}-hint`}
      onContextMenu={(e) => {
        e.preventDefault();
        openAt(e.clientX, e.clientY);
      }}
      onKeyDown={(e) => {
        if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
          e.preventDefault();
          const r = (document.activeElement as HTMLElement).getBoundingClientRect();
          openAt(r.left + r.width / 2, r.top + r.height / 2);
        }
      }}
    >
      {children}
      <span id={`${id}-hint`} className="k-sr-only">برای گزینه‌ها راست‌کلیک کنید یا Shift+F10 را بزنید.</span>
      <MenuCtx.Provider value={{ close }}>
        <ul
          ref={list}
          // لایهٔ بالایی مرورگر (Popover API): والدِ دارای transform جای position: fixed را عوض نمی‌کند
          {...({ popover: "manual" } as Record<string, string>)}
          role="menu"
          aria-label={label}
          className="k-menu k-menu--context"
          hidden={!pos}
          style={pos ? ({ "--_x": `${pos.x}px`, "--_y": `${pos.y}px` } as React.CSSProperties) : undefined}
          onKeyDown={(e) => menuKeyDown(e, list.current, () => close(), () => close(false))}
        >
          {menu}
        </ul>
      </MenuCtx.Provider>
    </div>
  );
}
