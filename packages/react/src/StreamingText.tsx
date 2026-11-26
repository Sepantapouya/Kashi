"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { cx } from "./cx.js";
import { useKashi } from "./KashiProvider.js";

export interface StreamingTextProps {
  /** متن تا این لحظه؛ در پاسخ زندهٔ مدل زبانی با هر تکهٔ تازه بلندتر می‌شود */
  text: string;
  /** هنوز در حال نوشتن است: نشانگر چشمک‌زن و aria-busy @default false */
  streaming?: boolean;
  /**
   * متن کامل را خودش کلمه‌به‌کلمه نشان می‌دهد (برای وقتی که پاسخ یک‌جا رسیده)؛
   * عدد، کلمه در ثانیه است. بدون آن فقط کلمه‌های تازهٔ text نرم ظاهر می‌شوند.
   */
  speed?: number;
  /** پس از نمایش کامل متن (در حالت speed) */
  onDone?: () => void;
  /** نشانگر انتهای متن @default true */
  cursor?: boolean;
  /** @default "p" */
  as?: ElementType;
  className?: string;
}

const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
/** کلمه‌ها با فاصلهٔ بعدشان؛ نیم‌فاصله داخل کلمه می‌ماند */
const words = (s: string) => s.match(/\S+\s*|\s+/g) ?? [];

/**
 * متنی که کلمه‌به‌کلمه نوشته می‌شود؛ برای پاسخ زندهٔ دستیار هوش مصنوعی.
 * صفحه‌خوان هر کلمه را جدا نمی‌خواند: متن تا پایان aria-busy است و پایان پاسخ یک بار اعلام می‌شود.
 */
export function StreamingText({ text, streaming = false, speed, onDone, cursor = true, as: Tag = "p", className }: StreamingTextProps) {
  const { messages: M } = useKashi();
  const all = words(text);
  const [shown, setShown] = useState(() => (speed && !reduced() ? 0 : all.length));
  // کلمه‌هایی که پیش از این دیده شده‌اند انیمیشن نمی‌گیرند
  const seen = useRef(speed ? 0 : all.length);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (!speed || reduced()) {
      setShown(all.length);
      return;
    }
    if (shown >= all.length) {
      done.current?.();
      return;
    }
    const t = setTimeout(() => setShown((n) => n + 1), 1000 / speed);
    return () => clearTimeout(t);
  }, [speed, shown, all.length]);

  const animated = !!speed && !reduced();
  const count = animated ? Math.min(shown, all.length) : all.length;
  useEffect(() => {
    seen.current = count;
  });

  const typing = streaming || (animated && count < all.length);
  // پایان نوشتن یک بار برای صفحه‌خوان اعلام می‌شود
  const was = useRef(typing);
  const [announce, setAnnounce] = useState("");
  useEffect(() => {
    if (was.current && !typing) setAnnounce(M.streaming.done);
    if (typing) setAnnounce("");
    was.current = typing;
  }, [typing, M.streaming.done]);
  const visible = all.slice(0, count);
  const from = seen.current;
  return (
    <Tag className={cx("k-stream", className)} dir="auto" aria-busy={typing || undefined} data-streaming={typing ? "" : undefined}>
      {visible.map((w, i) => (i < from ? w : <span key={i} className="k-stream__word">{w}</span>))}
      {cursor && typing && <span className="k-stream__cursor" aria-hidden="true" />}
      <span className="k-sr-only" aria-live="polite">{announce}</span>
    </Tag>
  );
}
