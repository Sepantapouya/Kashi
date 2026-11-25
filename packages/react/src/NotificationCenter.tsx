"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { formatRelative } from "@kashi-ui/persian";
import { cx } from "./cx.js";
import { useKashi } from "./KashiProvider.js";
import { Popover } from "./Popover.js";

export interface NotificationItem {
  id: string;
  title: ReactNode;
  body?: ReactNode;
  time: Date;
  read?: boolean;
  /** آواتار یا آیکون سمت شروع */
  icon?: ReactNode;
  tone?: "brand" | "success" | "warning" | "error";
  /** پیوند اعلان؛ بدون آن onSelect صدا زده می‌شود */
  href?: string;
}

export interface NotificationListProps {
  items: NotificationItem[];
  /** خوانده شدن یک اعلان (با کلیک یا دکمهٔ نقطه) */
  onRead?: (id: string) => void;
  onReadAll?: () => void;
  onSelect?: (item: NotificationItem) => void;
  /** دکمهٔ تنظیمات کنار عنوان */
  onSettings?: () => void;
  /** پیوند «دیدن همهٔ اعلان‌ها» پایین فهرست */
  viewAllHref?: string;
  /** عنوان بالای فهرست @default "اعلان‌ها" */
  title?: ReactNode;
  /** لحظهٔ مقایسه برای زمان نسبی و گروه امروز و دیروز @default اکنون */
  now?: Date;
  className?: string;
}

const svg = (d: string) => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
const Bell = () => svg("M5 8a5 5 0 0 1 10 0c0 4 1.5 5.5 1.5 5.5h-13S5 12 5 8ZM8.5 16.5a1.6 1.6 0 0 0 3 0");
const Gear = () => svg("M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM16 10a6 6 0 0 0-.1-1l1.6-1.3-1.5-2.6-2 .7a6 6 0 0 0-1.7-1L12 2.8H9l-.4 2a6 6 0 0 0-1.7 1l-2-.7-1.5 2.6L5 9a6 6 0 0 0 0 2l-1.6 1.3 1.5 2.6 2-.7a6 6 0 0 0 1.7 1l.4 2h3l.4-2a6 6 0 0 0 1.7-1l2 .7 1.5-2.6L15.9 11c.1-.3.1-.7.1-1Z");
const CheckAll = () => svg("m2.5 10.5 3 3 6-7M9 13.2l.3.3 6-7");
const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** فهرست اعلان‌ها با زبانه‌های «همه» و «خوانده‌نشده»، گروه امروز و دیروز و زمان نسبی فارسی؛ تنها یا داخل NotificationCenter */
export function NotificationList({ items, onRead, onReadAll, onSelect, onSettings, viewAllHref, title, now, className }: NotificationListProps) {
  const { messages: M, locale, digits, n } = useKashi();
  const N = M.notifications;
  const [tab, setTab] = useState<"all" | "unread">("all");
  const unread = items.filter((x) => !x.read).length;
  const list = tab === "unread" ? items.filter((x) => !x.read) : items;
  const ref = now ?? new Date();
  const today = day(ref);
  const groups: [string, NotificationItem[]][] = [[N.today, []], [N.yesterday, []], [N.earlier, []]];
  for (const it of [...list].sort((a, b) => b.time.getTime() - a.time.getTime())) {
    const d = day(it.time);
    groups[d >= today ? 0 : d >= today - 86_400_000 ? 1 : 2][1].push(it);
  }

  return (
    <div className={cx("k-notif", className)}>
      <div className="k-notif__head">
        <h2 className="k-notif__title">{title ?? N.label}</h2>
        {onReadAll && unread > 0 && (
          <button type="button" className="k-notif__link" onClick={onReadAll}><CheckAll />{N.markAll}</button>
        )}
        {onSettings && <button type="button" className="k-notif__icon" aria-label={N.settings} onClick={onSettings}><Gear /></button>}
      </div>
      <div className="k-notif__tabs" role="group">
        {(["all", "unread"] as const).map((t) => (
          <button key={t} type="button" className="k-notif__tab" aria-pressed={tab === t} onClick={() => setTab(t)}>
            {N[t]}
            {t === "unread" && unread > 0 && <span className="k-notif__count">{n(unread)}</span>}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <div className="k-notif__empty">
          <span className="k-notif__empty-icon"><Bell /></span>
          <p>{tab === "unread" ? N.emptyUnread : N.empty}</p>
        </div>
      ) : (
        <div className="k-notif__scroll" tabIndex={-1}>
          {groups.filter(([, g]) => g.length).map(([name, g]) => (
            <section key={name} className="k-notif__group" aria-label={name}>
              <h3 className="k-notif__group-title">{name}</h3>
              <ul className="k-notif__list">
                {g.map((it) => {
                  const inner = (
                    <>
                      {it.icon && <span className="k-notif__media" data-tone={it.tone}>{it.icon}</span>}
                      <span className="k-notif__text">
                        <span className="k-notif__item-title">{it.title}</span>
                        {it.body && <span className="k-notif__body">{it.body}</span>}
                        <time className="k-notif__time" dateTime={it.time.toISOString()}>{formatRelative(it.time, { now: ref, locale, digits })}</time>
                      </span>
                    </>
                  );
                  const select = () => {
                    if (!it.read) onRead?.(it.id);
                    onSelect?.(it);
                  };
                  return (
                    <li key={it.id} className="k-notif__item" data-unread={it.read ? undefined : ""}>
                      {it.href ? (
                        <a className="k-notif__main" href={it.href} onClick={select}>{inner}</a>
                      ) : (
                        <button type="button" className="k-notif__main" onClick={select}>{inner}</button>
                      )}
                      {!it.read && (
                        <button type="button" className="k-notif__dot" aria-label={N.markRead} title={N.markRead} onClick={() => onRead?.(it.id)}>
                          <span aria-hidden="true" />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
      {viewAllHref && <a className="k-notif__all" href={viewAllHref}>{N.viewAll}</a>}
    </div>
  );
}

export interface NotificationCenterProps extends NotificationListProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** @default "bottom-end" */
  placement?: "bottom-start" | "bottom-end";
}

/** دکمهٔ زنگ با شمار اعلان‌های خوانده‌نشده که فهرست اعلان‌ها را در پاپ‌اور باز می‌کند */
export function NotificationCenter({ open, onOpenChange, placement = "bottom-end", className, ...list }: NotificationCenterProps) {
  const { messages: M, n } = useKashi();
  const N = M.notifications;
  const unread = list.items.filter((x) => !x.read).length;
  // با رسیدن اعلان تازه، شمارنده یک بار تکان می‌خورد
  const prev = useRef(unread);
  const [bump, setBump] = useState(0);
  useEffect(() => {
    if (unread > prev.current) setBump((b) => b + 1);
    prev.current = unread;
  }, [unread]);
  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
      placement={placement}
      aria-label={N.label}
      className={cx("k-notif-pop", className)}
      trigger={
        <button type="button" className="k-btn k-btn--tertiary k-btn--icon k-notif__bell" aria-label={unread ? N.button(n(unread)) : N.label}>
          <Bell />
          {unread > 0 && <span key={bump} className="k-notif__badge" aria-hidden="true">{unread > 99 ? `${n(99)}+` : n(unread)}</span>}
        </button>
      }
    >
      <NotificationList {...list} />
    </Popover>
  );
}
