"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cx } from "./cx.js";
import { Drawer } from "./Drawer.js";
import { useKashi } from "./KashiProvider.js";

export interface NavbarLink {
  href: string;
  label: ReactNode;
  /** صفحهٔ فعلی؛ aria-current="page" می‌گیرد */
  current?: boolean;
  icon?: ReactNode;
  /** بج کنار عنوان، مثل «جدید» یا تعداد */
  badge?: ReactNode;
}

export interface NavbarProps {
  /** لوگو و نام */
  brand: ReactNode;
  /** @default "/" */
  brandHref?: string;
  links?: NavbarLink[];
  /** دکمه‌ها و آیکون‌های سمت چپ (در RTL)، مثل ورود یا جستجو */
  actions?: ReactNode;
  /** چسبیدن به بالای صفحه؛ با اسکرول سایه و پس‌زمینهٔ مات می‌گیرد @default true */
  sticky?: boolean;
  /** نشان صفحهٔ فعلی: «line» خط زیر پیوند، «pill» قرص رنگی @default "line" */
  variant?: "line" | "pill";
  /** پیوندها وسط نوار، لوگو و دکمه‌ها در دو طرف */
  centered?: boolean;
  /** نوار شناور: جدا از لبه‌ها با گوشهٔ گرد و سایه */
  floating?: boolean;
  /** بی‌رنگ روی تصویر یا هیرو؛ با sticky، پس از اسکرول پس‌زمینه می‌گیرد */
  transparent?: boolean;
  /** زیر این عرض پیوندها به منوی کشو می‌روند: sm ۶۴۰، md ۷۶۸، lg ۱۰۲۴ پیکسل @default "md" */
  collapseBelow?: "sm" | "md" | "lg";
  /** محتوای اضافهٔ پایین منوی گوشی، مثل دکمهٔ ورود */
  menuFooter?: ReactNode;
  /** کامپوننت پیوند، مثل Link در Next.js @default "a" */
  linkAs?: ElementType;
  /** @default "ناوبری اصلی" */
  "aria-label"?: string;
  className?: string;
}

const useIsoLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * نوار ناوبری بالای سایت: لوگو، پیوندها با نشانگر لغزان، دکمه‌ها
 * و در گوشی منوی کشو با همان پیوندها. با اسکرول سایه می‌گیرد.
 */
export function Navbar({
  brand, brandHref = "/", links = [], actions, sticky = true, variant = "line", centered, floating, transparent, collapseBelow = "md", menuFooter, linkAs, "aria-label": ariaLabel, className,
}: NavbarProps) {
  const { messages: M } = useKashi();
  const label = ariaLabel ?? M.navbar.label;
  const A = linkAs ?? "a";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const nav = useRef<HTMLElement>(null);

  // نشانگر لغزان: روی پیوند زیر نشانگر یا پیوند فعلی
  const place = (el: HTMLElement | null) => {
    const n = nav.current;
    if (!n) return;
    if (!el) { n.style.setProperty("--_pill-o", "0"); return; }
    n.style.setProperty("--_pill-x", `${el.offsetLeft}px`);
    n.style.setProperty("--_pill-w", `${el.offsetWidth}px`);
    n.style.setProperty("--_pill-o", "1");
  };
  const toCurrent = () => place(nav.current?.querySelector<HTMLElement>('[aria-current="page"]') ?? null);
  useIsoLayout(() => {
    toCurrent();
    const n = nav.current;
    if (!n || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(toCurrent);
    ro.observe(n);
    return () => ro.disconnect();
  }, [links]);

  useEffect(() => {
    // فقط نوار چسبیده با اسکرول صفحه تغییر می‌کند؛ نوار غیرچسبیده همراه محتوا بالا می‌رود
    if (!sticky) return;
    const on = () => setScrolled(window.scrollY > 4);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [sticky]);

  const item = (l: NavbarLink, i: number, cls: string, onClick?: () => void) => (
    <A key={i} href={l.href} className={cls} aria-current={l.current ? "page" : undefined} onClick={onClick}>
      {l.icon && <span className="k-navbar__icon" aria-hidden="true">{l.icon}</span>}
      <span>{l.label}</span>
      {l.badge && <span className="k-navbar__badge">{l.badge}</span>}
    </A>
  );

  return (
    <header
      className={cx("k-navbar", sticky && "k-navbar--sticky", variant === "pill" && "k-navbar--pill", centered && "k-navbar--centered", floating && "k-navbar--floating", transparent && "k-navbar--transparent", `k-navbar--collapse-${collapseBelow}`, className)}
      data-scrolled={scrolled || undefined}
    >
      <div className="k-navbar__inner">
        <A href={brandHref} className="k-navbar__brand">{brand}</A>
        {links.length > 0 && (
          <nav ref={nav} className="k-navbar__nav" aria-label={label} onPointerLeave={toCurrent}>
            <span className="k-navbar__pill" aria-hidden="true" />
            {links.map((l, i) => (
              <A
                key={i}
                href={l.href}
                className="k-navbar__link"
                aria-current={l.current ? "page" : undefined}
                onPointerEnter={(e: { currentTarget: HTMLElement }) => place(e.currentTarget)}
                onFocus={(e: { currentTarget: HTMLElement }) => place(e.currentTarget)}
                onBlur={toCurrent}
              >
                {l.icon && <span className="k-navbar__icon" aria-hidden="true">{l.icon}</span>}
                <span>{l.label}</span>
                {l.badge && <span className="k-navbar__badge">{l.badge}</span>}
              </A>
            ))}
          </nav>
        )}
        <div className="k-navbar__actions">
          {actions}
          {links.length > 0 && (
            <button type="button" className="k-btn k-btn--tertiary k-btn--icon k-btn--sm k-navbar__menu" aria-label={M.navbar.menu} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true"><path d="M3.75 5.5h12.5M3.75 10h12.5M3.75 14.5h12.5" /></svg>
            </button>
          )}
        </div>
      </div>
      {links.length > 0 && (
        <Drawer open={open} onOpenChange={setOpen} side="start" size="sm" title={M.navbar.menuTitle} footer={menuFooter} className="k-navbar__drawer">
          <nav className="k-navbar__mobile" aria-label={label}>
            {links.map((l, i) => item(l, i, "k-navbar__mobile-link", () => setOpen(false)))}
          </nav>
        </Drawer>
      )}
    </header>
  );
}
