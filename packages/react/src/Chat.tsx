"use client";

import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { formatRelative } from "@kashi-ui/persian";
import { cx } from "./cx.js";
import { useKashi } from "./KashiProvider.js";

/* ---------- آیکون‌ها ---------- */
const svg = (d: ReactNode, w = 1.7) => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
const Tick = () => svg(<path d="m4.5 10.5 3 3 6-7" />, 1.9);
const Ticks = () => svg(<><path d="m2.5 10.5 3 3 6-7" /><path d="m9 13.2.3.3 6-7" /></>, 1.9);
const Clock = () => svg(<><circle cx="10" cy="10" r="6.5" /><path d="M10 6.5V10l2 1.5" /></>);
const Alert = () => svg(<><circle cx="10" cy="10" r="7" /><path d="M10 6.5v4M10 13.5h.01" /></>);
const Copy = () => svg(<><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /></>);
const Check = () => svg(<path d="m5 10.5 3.2 3L15 7" />, 2);
const Retry = () => svg(<><path d="M4 10a6 6 0 1 0 1.8-4.3" /><path d="M4 3.5V7h3.5" /></>);
const Up = () => svg(<path d="M6.5 9 9.5 3.5a1.6 1.6 0 0 1 2.9 1.2L11.5 8h3.8a1.5 1.5 0 0 1 1.5 1.8l-1.2 5.5a1.5 1.5 0 0 1-1.5 1.2H6.5M6.5 9v7.5M6.5 9H4v7.5h2.5" />);
const Down = () => svg(<path d="M13.5 11 10.5 16.5a1.6 1.6 0 0 1-2.9-1.2L8.5 12H4.7a1.5 1.5 0 0 1-1.5-1.8l1.2-5.5A1.5 1.5 0 0 1 5.9 3.5h7.6M13.5 11V3.5m0 7.5H16V3.5h-2.5" />);
const Arrow = () => svg(<path d="M10 4v12m0 0-4.5-4.5M10 16l4.5-4.5" />, 1.9);

/* ---------- گفتگو ---------- */
export interface ChatThreadProps extends HTMLAttributes<HTMLDivElement> {
  /** نام گفتگو برای صفحه‌خوان @default "گفتگو" */
  label?: string;
  /** با پیام تازه به پایین برود، اگر کاربر نزدیک پایین است @default true */
  autoScroll?: boolean;
  children: ReactNode;
}

/**
 * ظرف پیام‌ها: ناحیهٔ log که پیام تازه را برای صفحه‌خوان می‌خواند، با پیام تازه پایین می‌ماند
 * (مگر کاربر بالا رفته باشد) و دکمهٔ «رفتن به آخرین پیام» نشان می‌دهد.
 */
export function ChatThread({ label, autoScroll = true, className, children, ...rest }: ChatThreadProps) {
  const { messages: M } = useKashi();
  const ref = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const [away, setAway] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const toEnd = () => {
      if (autoScroll && stick.current) el.scrollTop = el.scrollHeight;
    };
    toEnd();
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(toEnd) : null;
    const mo = new MutationObserver(toEnd);
    for (const c of Array.from(el.children)) ro?.observe(c);
    mo.observe(el, { childList: true, subtree: true, characterData: true });
    return () => {
      ro?.disconnect();
      mo.disconnect();
    };
  }, [autoScroll]);

  return (
    <div className={cx("k-chat", className)}>
      <div
        ref={ref}
        className="k-chat__scroll"
        role="log"
        aria-live="polite"
        aria-label={label ?? M.chat.thread}
        tabIndex={0}
        onScroll={(e) => {
          const el = e.currentTarget;
          const near = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
          stick.current = near;
          setAway(!near);
        }}
        {...rest}
      >
        {children}
      </div>
      <button
        type="button"
        className="k-chat__jump"
        data-show={away ? "" : undefined}
        tabIndex={away ? 0 : -1}
        aria-hidden={!away}
        aria-label={M.chat.scrollDown}
        onClick={() => {
          stick.current = true;
          ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
        }}
      >
        <Arrow />
      </button>
    </div>
  );
}

/** جداکنندهٔ روز یا بخش داخل گفتگو، مثل «امروز» */
export function ChatDivider({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("k-chat__divider", className)} role="separator">{children}</div>;
}

export type ChatRole = "user" | "assistant" | "system";
export type ChatStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export interface ChatMessageProps extends Omit<HTMLAttributes<HTMLDivElement>, "role"> {
  /** فرستنده: کاربر سمت پایان خط (در راست‌به‌چپ، چپ)، دستیار سمت شروع @default "assistant" */
  from?: ChatRole;
  /** نام فرستنده؛ برای صفحه‌خوان و گفتگوی گروهی */
  name?: string;
  /** آواتار یا هر عنصر کوچک کنار پیام */
  avatar?: ReactNode;
  /** زمان ارسال؛ Date به شکل نسبی نشان داده می‌شود */
  time?: Date | string;
  /** وضعیت پیام کاربر */
  status?: ChatStatus;
  /** پیام ویرایش شده است */
  edited?: boolean;
  /** متن ساده برای دکمهٔ کپی؛ با آن دکمهٔ کپی نشان داده می‌شود */
  copyText?: string;
  /** دکمهٔ «تلاش دوباره» برای پیام ناموفق یا پاسخ دستیار */
  onRetry?: () => void;
  /** دکمه‌های پسندیدن و نپسندیدن پاسخ دستیار */
  onFeedback?: (value: "up" | "down") => void;
  /** بازخورد انتخاب‌شده */
  feedback?: "up" | "down" | null;
  /** دکمه‌های دلخواه دیگر زیر پیام */
  actions?: ReactNode;
  children: ReactNode;
}

/** حباب پیام در گفتگو یا رابط هوش مصنوعی؛ جهت متن هر پیام خودکار است تا پیام انگلیسی هم درست چیده شود */
export function ChatMessage({
  from = "assistant", name, avatar, time, status, edited, copyText, onRetry, onFeedback, feedback, actions, className, children, ...rest
}: ChatMessageProps) {
  const { messages: M, locale, digits } = useKashi();
  const C = M.chat;
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const who = name ?? (from === "user" ? C.you : from === "assistant" ? C.assistant : undefined);
  const timeText = time instanceof Date ? formatRelative(time, { locale, digits }) : time;
  const statusIcon = status === "sending" ? <Clock /> : status === "failed" ? <Alert /> : status === "sent" ? <Tick /> : status ? <Ticks /> : null;
  const hasActions = copyText !== undefined || onRetry || onFeedback || actions;

  if (from === "system") return <div className={cx("k-chat__system", className)} {...rest}>{children}</div>;

  return (
    <div className={cx("k-msg", className)} data-from={from} data-status={status} {...rest}>
      {avatar && <div className="k-msg__avatar">{avatar}</div>}
      <div className="k-msg__main">
        {name && <div className="k-msg__name">{name}</div>}
        {/* نام فرستنده بیرون از حباب، تا جهت خودکار پیام انگلیسی را فارسی نکند */}
        {who && !name && <span className="k-sr-only">{who}: </span>}
        <div className="k-msg__bubble" dir="auto">{children}</div>
        {(timeText || status || edited) && (
          <div className="k-msg__meta">
            {edited && <span>{C.edited}</span>}
            {timeText && <time dateTime={time instanceof Date ? time.toISOString() : undefined}>{timeText}</time>}
            {status && <span className="k-msg__status" data-status={status} role="img" aria-label={C[status]}>{statusIcon}</span>}
          </div>
        )}
        {hasActions && (
          <div className="k-msg__actions" role="group" aria-label={C.actions}>
            {copyText !== undefined && (
              <button
                type="button"
                className="k-msg__action"
                aria-label={copied ? C.copied : C.copy}
                data-done={copied ? "" : undefined}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(copyText);
                    setCopied(true);
                    clearTimeout(timer.current);
                    timer.current = setTimeout(() => setCopied(false), 2000);
                  } catch {
                    /* کلیپ‌بورد در دسترس نیست */
                  }
                }}
              >
                {copied ? <Check /> : <Copy />}
              </button>
            )}
            {onRetry && <button type="button" className="k-msg__action" aria-label={C.retry} onClick={onRetry}><Retry /></button>}
            {onFeedback && (
              <>
                <button type="button" className="k-msg__action" aria-label={C.like} aria-pressed={feedback === "up"} onClick={() => onFeedback("up")}><Up /></button>
                <button type="button" className="k-msg__action" aria-label={C.dislike} aria-pressed={feedback === "down"} onClick={() => onFeedback("down")}><Down /></button>
              </>
            )}
            {actions}
            <span className="k-sr-only" aria-live="polite">{copied ? C.copied : ""}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export interface TypingIndicatorProps {
  /** نام کسی که می‌نویسد؛ برای صفحه‌خوان */
  name?: string;
  /** نمایش متن کنار نقطه‌ها */
  showLabel?: boolean;
  className?: string;
}

/** نشانگر «در حال نوشتن…» با سه نقطهٔ موجی؛ صفحه‌خوان یک بار می‌خواندش */
export function TypingIndicator({ name, showLabel, className }: TypingIndicatorProps) {
  const { messages: M } = useKashi();
  const text = name ? M.chat.typing(name) : M.chat.typingShort;
  return (
    <div className={cx("k-typing", className)} role="status">
      <span className="k-typing__dots" aria-hidden="true"><i /><i /><i /></span>
      {showLabel ? <span className="k-typing__label">{text}…</span> : <span className="k-sr-only">{text}</span>}
    </div>
  );
}
