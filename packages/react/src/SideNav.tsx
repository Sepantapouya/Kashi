import { useId, useState, type ReactNode } from "react";
import { cx } from "./cx.js";

export interface SideNavItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  /** نشان کنار مورد، مثل تعداد */
  badge?: ReactNode;
  current?: boolean;
  onClick?: () => void;
  /** زیرمنو؛ مورد والد به دکمهٔ باز و بسته تبدیل می‌شود */
  items?: SideNavItem[];
}

export interface SideNavSection {
  label?: string;
  items: SideNavItem[];
}

export interface SideNavProps {
  sections: SideNavSection[];
  header?: ReactNode;
  footer?: ReactNode;
  /** فقط آیکون‌ها؛ نام هر مورد با aria-label و title حفظ می‌شود */
  collapsed?: boolean;
  /** @default "اصلی" */
  "aria-label"?: string;
  className?: string;
}

const Chevron = () => (
  <svg className="k-sidenav__chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 8 4 4 4-4" /></svg>
);

const hasCurrent = (it: SideNavItem): boolean => Boolean(it.current || it.items?.some(hasCurrent));

function Item({ item, collapsed }: { item: SideNavItem; collapsed?: boolean }) {
  const id = useId();
  // زیرمنویی که صفحهٔ فعلی در آن است از اول باز است
  const [open, setOpen] = useState(() => Boolean(item.items?.some(hasCurrent)));
  const a11y = collapsed ? { "aria-label": item.label, title: item.label } : {};
  const inner = (
    <>
      {item.icon}
      <span className="k-sidenav__text">{item.label}</span>
      {item.badge}
    </>
  );

  if (item.items?.length) {
    return (
      <li>
        <button type="button" className="k-sidenav__item" aria-expanded={open} aria-controls={`${id}-sub`} onClick={() => setOpen((o) => !o)} {...a11y}>
          {inner}
          <Chevron />
        </button>
        <ul className="k-sidenav__sub" id={`${id}-sub`} role="list" hidden={!open}>
          {item.items.map((s) => <Item key={s.label} item={s} collapsed={collapsed} />)}
        </ul>
      </li>
    );
  }

  const props = { className: "k-sidenav__item", "aria-current": item.current ? ("page" as const) : undefined, onClick: item.onClick, ...a11y };
  return <li>{item.href ? <a href={item.href} {...props}>{inner}</a> : <button type="button" {...props}>{inner}</button>}</li>;
}

/** ناوبری کناری پنل مدیریت با گروه، زیرمنو، نشان و حالت جمع‌شده */
export function SideNav({ sections, header, footer, collapsed, "aria-label": ariaLabel = "اصلی", className }: SideNavProps) {
  const id = useId();
  return (
    <nav className={cx("k-sidenav", collapsed && "k-sidenav--collapsed", className)} aria-label={ariaLabel}>
      {header && <div className="k-sidenav__header">{header}</div>}
      {sections.map((sec, i) => (
        <div key={sec.label ?? i}>
          {sec.label && <p className="k-sidenav__label" id={`${id}-s${i}`}>{sec.label}</p>}
          <ul className="k-sidenav__group" role="list" aria-labelledby={sec.label ? `${id}-s${i}` : undefined}>
            {sec.items.map((it) => <Item key={it.label} item={it} collapsed={collapsed} />)}
          </ul>
        </div>
      ))}
      {footer && <div className="k-sidenav__footer">{footer}</div>}
    </nav>
  );
}
